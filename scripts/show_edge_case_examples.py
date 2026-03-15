#!/usr/bin/env python3
import json
import re

# Load the course details
with open('data/uva_course_details.json') as f:
    courses = json.load(f)

# Define patterns for multiple course selection scenarios
patterns = {
    'OR Clause (Basic Choice)': {
        'desc': 'Simple OR between course options',
        'pattern': r'(?:prerequisite|requirement).*?(?:cs|course)\s+\d+\s+or\s+(?:cs|course)\s+\d+'
    },
    'Multiple Options (N of M)': {
        'desc': '2, 3, or N of the following courses',
        'pattern': r'(\d+)\s+of\s+(?:the\s+)?(following|these)'
    },
    'OR Equivalent': {
        'desc': 'Accept course equivalent or substitution',
        'pattern': r'or\s+(?:an\s+)?equivalent'
    },
    'OR Permission': {
        'desc': 'Course OR permission/consent from instructor',
        'pattern': r'or\s+(?:permission|consent|approval)\s+(?:from|of)'
    },
    'Combined AND/OR': {
        'desc': 'Mix of AND and OR operations',
        'pattern': r'(?:and|AND).*?(?:or|OR)|(?:or|OR).*?(?:and|AND)'
    },
    'Corequisite': {
        'desc': 'Course must be taken at the same time',
        'pattern': r'corequisite'
    },
    'Enrollment Restriction': {
        'desc': 'Based on major, year, or program enrollment',
        'pattern': r'(?:restricted|must be enrolled|students must)\s+(?:to|in)'
    },
    'Year Requirement': {
        'desc': 'Require second year standing, junior, etc.',
        'pattern': r'(?:junior|senior|sophomore|second year|first year|standing)'
    },
}

# Collect examples for each pattern
examples = {name: [] for name in patterns.keys()}

for course in courses:
    req = course.get('enrollment_requirements', '')
    if not req:
        continue
    
    code = course.get('course_code', '')
    
    for pattern_name, info in patterns.items():
        if pattern_name not in examples or len(examples[pattern_name]) >= 3:
            continue
        if re.search(info['pattern'], req, re.IGNORECASE):
            examples[pattern_name].append({
                'code': code,
                'req': req
            })

# Display results
print("\n" + "="*100)
print("EDGE CASE PATTERNS FOR MULTIPLE COURSE SELECTION")
print("="*100)

for pattern_name, info in patterns.items():
    print(f"\n\n{'─'*100}")
    print(f"PATTERN: {pattern_name}")
    print(f"Description: {info['desc']}")
    print('─'*100)
    
    exs = examples.get(pattern_name, [])
    if exs:
        for i, ex in enumerate(exs, 1):
            print(f"\nExample {i}: {ex['code']}")
            print(f"Requirement: {ex['req']}")
    else:
        print("No examples found")

print(f"\n\n{'='*100}\n")