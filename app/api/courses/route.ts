import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// Cache the courses in memory so we don't parse the 10MB CSV on every request
let cachedCourses: { id: string, mnemonic: string, number: string, title: string }[] | null = null;

function getCourses() {
  if (cachedCourses) return cachedCourses;

  try {
    const filePath = path.join(process.cwd(), 'public', 'audit_requirements.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });

    const courseSet = new Set<string>();
    const courses: { id: string, mnemonic: string, number: string, title: string }[] = [];

    records.forEach((record: any) => {
      const reqName = record['Requirement Name'];
      // Match course format like "CS 1110"
      if (reqName && /^[A-Z]{2,4}\s\d{4}$/.test(reqName)) {
        if (!courseSet.has(reqName)) {
          courseSet.add(reqName);
          const [mnemonic, number] = reqName.split(' ');
          courses.push({
            id: reqName,
            mnemonic,
            number,
            title: reqName, // We don't have full titles in this CSV format easily accessible
          });
        }
      }
    });

    // Sort alphabetically
    courses.sort((a, b) => a.id.localeCompare(b.id));
    cachedCourses = courses;
    return courses;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase();

  try {
    const allCourses = getCourses();

    if (!query) {
      return NextResponse.json(allCourses.slice(0, 50)); // Return first 50 if no query
    }

    // Filter courses based on query
    const filteredCourses = allCourses.filter(course => 
      course.id.toLowerCase().includes(query) || 
      course.mnemonic.toLowerCase().includes(query) ||
      course.number.includes(query)
    ).slice(0, 50); // Limit to 50 results

    return NextResponse.json(filteredCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
