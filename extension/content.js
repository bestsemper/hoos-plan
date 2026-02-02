// content.js

console.log("Plan Your Future - TCF Overlay: Content script loaded.");

const TCF_BASE_URL = "https://thecourseforum.com";
let subdepartments = {};
let courseCache = {}; // { subdept_id: { course_number: courseData } }

// Helper: Fetch with error handling
async function tcfFetch(endpoint) {
  try {
    const response = await fetch(`${TCF_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`TCF Fetch Error for ${endpoint}:`, error);
    return null;
  }
}

// 1. Fetch Subdepartments on init
async function initSubdepartments() {
  const data = await tcfFetch("/api/subdepartments/");
  if (data) {
    // API returns a list (maybe paginated? The serializer seems to imply just list or results)
    // The previous code snippet showed `$.each(data, ...)` so it might be a raw array.
    // But ViewSets usually return { count, next, previous, results } unless paginator is off.
    // I'll check if it's an array or object.
    const results = Array.isArray(data) ? data : (data.results || []);
    
    results.forEach(sub => {
      // Map mnemonic (e.g. "CS") to ID (e.g. 5)
      if (sub.mnemonic && sub.id) {
        subdepartments[sub.mnemonic.toUpperCase()] = sub.id;
      }
    });
    console.log("TCF Subdepartments loaded:", Object.keys(subdepartments).length);
  }
}

// 2. Fetch courses for a specific subdepartment (cached)
async function fetchCoursesForSubdept(subdeptId) {
  if (courseCache[subdeptId]) return courseCache[subdeptId];

  // Using simplestats to get ratings and GPA
  // Page size 1000 to hopefully get all courses in one go or pagination loop might be needed.
  // The code snippet showed `pageSize = "100"` in new_review.js.
  // I'll try a large page size.
  const endpoint = `/api/courses/?subdepartment=${subdeptId}&simplestats&page_size=500`;
  
  const data = await tcfFetch(endpoint);
  const map = {};
  
  if (data) {
    const results = Array.isArray(data) ? data : (data.results || []);
    results.forEach(course => {
      // Map course number (e.g. "1010") to data
      if (course.number) {
        map[course.number] = course;
      }
    });
  }
  
  courseCache[subdeptId] = map;
  return map;
}

// 3. Scan and overlay
async function scanAndOverlay() {
  if (Object.keys(subdepartments).length === 0) {
    await initSubdepartments();
  }

  // Simple regex for "CS 1010" or "CS1010"
  // Mnemonic: 2-4 letters, space optional, 4 digits
  const regex = /\b([A-Z]{2,4})\s?(\d{4})\b/g;

  // We want to find text nodes to avoid messing up HTML attributes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  const nodesToProcess = [];
  while (node = walker.nextNode()) {
    // Filter out script/style tags just in case
    if (node.parentElement && ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(node.parentElement.tagName)) {
      continue;
    }
    if (node.textContent.match(regex)) {
      nodesToProcess.push(node);
    }
  }

  // Iterate and process
  for (const textNode of nodesToProcess) {
    const text = textNode.textContent;
    let match;
    let newHtml = text;
    let hasMatch = false;
    
    // We can't easily replace multiple matches in one text node with HTML links without splitting the node
    // or replacing the parent's innerHTML (risky).
    // For safety, let's just create a wrapper if it's a clean match, or simple span replacement if parent allows.
    
    // Simpler approach: replace textual content in parent with specific spans we can hydrate later?
    // Or just look for specific known elements if this was a specific site.
    // For a generic overlay, this is hard.
    
    // Let's assume we are mostly looking for dedicated course code elements.
    // I'll skip complex text replacement for this MVP and just try to find elements that *are* the course code.
    // OR, I can use the tool tip approach: wrap matches in a <span class="tcf-match"> and attach events.
    
    // Let's try wrapping matches in parent's innerHTML. WARNING: resets event listeners on siblings.
    // Safe way: split text node.
    
    // Reset regex state
    regex.lastIndex = 0;
    
    const matches = [...text.matchAll(regex)];
    if (matches.length === 0) continue;

    const parent = textNode.parentNode;
    // skip if already processed
    if (parent.classList.contains("tcf-processed")) continue;
    
    // We will replace the text node with a fragment
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    for (const m of matches) {
      const mnemonic = m[1].toUpperCase();
      const number = m[2];
      const fullMatch = m[0];
      const matchIndex = m.index;
      
      // Text before match
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchIndex)));
      
      // The match element
      const span = document.createElement("span");
      span.textContent = fullMatch;
      span.className = "tcf-course-link";
      span.style.borderBottom = "2px dashed #e57200"; // UVA Orange
      span.style.cursor = "pointer";
      span.dataset.mnemonic = mnemonic;
      span.dataset.number = number;
      
      // Add click/hover listener to show overlay
      span.addEventListener("mouseenter", (e) => showOverlay(e, mnemonic, number));
      span.addEventListener("mouseleave", hideOverlay);
      
      fragment.appendChild(span);
      
      lastIndex = matchIndex + fullMatch.length;
    }
    
    // Remaining text
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    
    parent.replaceChild(fragment, textNode);
    parent.classList.add("tcf-processed");
  }
}

let tooltip = null;

function createTooltip() {
  if (tooltip) return;
  tooltip = document.createElement("div");
  tooltip.id = "tcf-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "white";
  tooltip.style.border = "1px solid #ccc";
  tooltip.style.padding = "10px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  tooltip.style.zIndex = "10000";
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "300px";
  tooltip.style.fontSize = "14px";
  tooltip.style.color = "#333";
  document.body.appendChild(tooltip);
}

async function showOverlay(event, mnemonic, number) {
  createTooltip();
  
  const rect = event.target.getBoundingClientRect();
  tooltip.style.left = `${window.scrollX + rect.left}px`;
  tooltip.style.top = `${window.scrollY + rect.bottom + 5}px`;
  tooltip.style.display = "block";
  tooltip.innerHTML = `Loading data for ${mnemonic} ${number}...`;
  
  // Fetch data
  const subdeptId = subdepartments[mnemonic];
  if (!subdeptId) {
    tooltip.innerHTML = `Subject ${mnemonic} not found in TCF.`;
    return;
  }
  
  const deptCourses = await fetchCoursesForSubdept(subdeptId);
  const course = deptCourses[number];
  
  if (course) {
    const rating = course.average_rating ? course.average_rating.toFixed(2) : "N/A";
    const gpa = course.average_gpa ? course.average_gpa.toFixed(2) : "N/A";
    const difficulty = course.average_difficulty ? course.average_difficulty.toFixed(2) : "N/A";
    
    tooltip.innerHTML = `
      <strong>${course.title}</strong><br/>
      <hr style="margin: 5px 0"/>
      Rating: ${rating} / 5.00<br/>
      GPA: ${gpa}<br/>
      Difficulty: ${difficulty} / 5.00<br/>
      <a href="https://thecourseforum.com/course/${mnemonic}/${number}" target="_blank" style="color: #007bc2">View on theCourseForum</a>
    `;
  } else {
    tooltip.innerHTML = `Course ${mnemonic} ${number} not found on TCF.`;
  }
}

function hideOverlay() {
  if (tooltip) {
    tooltip.style.display = "none";
  }
}

// Run scan periodically (mutation observer is better but this is MVP)
setInterval(scanAndOverlay, 3000);
scanAndOverlay();

