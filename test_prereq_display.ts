import { checkPrerequisites } from './app/utils/prerequisiteChecker';

// Test with MATH 4250: (MATH 3351 OR (APMA 3080 AND MATH 3310)) OR MATH 4310
const result = checkPrerequisites('MATH 4250', [], []);

console.log('=== MATH 4250 Prerequisite Check ===');
console.log('isSatisfied:', result.isSatisfied);
console.log('\nmissingCourses (comprehensive flat list):');
console.log(result.missingCourses);
console.log('\ndetailedRequirements:');
result.detailedRequirements.forEach((req, i) => {
  console.log(`[${i}] type: ${req.type}`);
  console.log(`    description: ${req.description}`);
  console.log(`    missingCourses: ${req.missingCourses?.join(', ')}`);
});

// Verify all courses in missingCourses are covered in detailedRequirements
const coveredInDetails = new Set<string>();
result.detailedRequirements.forEach(req => {
  req.missingCourses?.forEach(c => coveredInDetails.add(c.toUpperCase()));
});

const uncovered = result.missingCourses.filter(c => !coveredInDetails.has(c.toUpperCase()));
console.log('\n=== Verification ===');
console.log('Uncovered courses:', uncovered.length === 0 ? 'None ✓' : uncovered);
