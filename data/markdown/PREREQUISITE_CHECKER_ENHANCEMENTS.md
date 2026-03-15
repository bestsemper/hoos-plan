# Prerequisite Checker - Enhanced Warning System

## Overview
The prerequisite checker has been updated to support complex prerequisite structures including:
- **Simple courses**: Basic "Prerequisite: CS 1110"
- **AND logic**: "Prerequisite: CS 1110 AND MATH 1310"
- **OR logic**: "Prerequisite: CS 1110 OR CS 1112"
- **COUNT constraints**: "Need 2 of the following: CS 1110, CS 2110, CS 2100"
- **Complex nested logic**: Combinations of all above

## New Data Types

### `CountNode`
```typescript
type CountNode = {
  type: 'count';
  count: number;           // How many courses required
  children: PrerequisiteTree[];  // Course options
};
```

### `RequirementMissing`
```typescript
interface RequirementMissing {
  type: 'course' | 'count' | 'or' | 'and';
  description: string;     // Human-readable description
  missingCourses: string[]; // List of courses not yet taken
  satisfiedCount?: number;  // For count nodes: how many already satisfied
  requiredCount?: number;   // For count nodes: how many are needed
}
```

## Enhanced Warning Messages

### Example 1: Count Constraint
**Requirement**: "Need 1 of the following: STAT 2020 or STAT 2120"
**Missing Requirements**:
```json
{
  "type": "count",
  "description": "Need 1 more of: STAT 2020, STAT 2120",
  "missingCourses": ["STAT 2020", "STAT 2120"],
  "satisfiedCount": 0,
  "requiredCount": 1
}
```

### Example 2: OR Requirement  
**Requirement**: "Need one of: MATH 1310, APMA 1110"
**Missing Requirements**:
```json
{
  "type": "or",
  "description": "Need one of: MATH 1310, APMA 1110",
  "missingCourses": ["MATH 1310", "APMA 1110"]
}
```

### Example 3: Complex AND with COUNT
**Requirement**: "CS 2100 AND (need 2 of: MATH 1310, APMA 1110, MATH 2310)"
**Missing Requirements**:
```json
[
  {
    "type": "course",
    "description": "CS 2100",
    "missingCourses": ["CS 2100"]
  },
  {
    "type": "count",
    "description": "Need 2 more of: MATH 1310, APMA 1110, MATH 2310",
    "missingCourses": ["MATH 1310", "APMA 1110", "MATH 2310"],
    "satisfiedCount": 0,
    "requiredCount": 2
  }
]
```

## API Changes

### `checkPrerequisites()` Return Type
```typescript
interface PrerequisiteCheckResult {
  isSatisfied: boolean;
  hasNoPrerequisites: boolean;
  missingCourses: string[];           // Simple list (backward compatible)
  detailedRequirements: RequirementMissing[]; // NEW: Detailed requirements
  hasUnknownPrerequisites: boolean;
}
```

### New Function: `getDetailedMissingRequirements()`
```typescript
export function getDetailedMissingRequirements(
  tree: PrerequisiteTree,
  taken: Set<string>
): RequirementMissing[]
```
Provides human-readable descriptions of what requirements are missing.

## UI Integration

### Before
```
⚠️ Missing: CS 1110, CS 2100, STAT 2020
```

### After  
```
⚠️ Missing: CS 1110; Need 2 of: CS 2110, CS 2100; Need one of: STAT 2020, STAT 2120
```

## Implementation Details

### Tree Evaluation
The `evaluateTreeRecursive()` function now handles:
- **COUNT nodes**: Counts how many children are satisfied, returns `satisfiedCount >= requiredCount`
- **AND nodes**: Requires all children satisfied
- **OR nodes**: Requires at least one child satisfied
- **COURSE nodes**: Checks if course code is in taken set

### Missing Requirement Collection
The `getDetailedMissingRequirements()` function:
1. Recursively traverses the prerequisite tree
2. For each unsatisfied node, generates a `RequirementMissing` object
3. For COUNT nodes, includes satisfaction count
4. For OR nodes, lists all course options
5. For AND nodes, lists requirements that still need to be met

## Files Modified

### `/app/utils/prerequisiteChecker.ts`
- Added `CountNode` type
- Updated `PrerequisiteTree` union type
- Added `RequirementMissing` interface
- Added `getDetailedMissingRequirements()` function
- Updated `evaluateTreeRecursive()` to handle COUNT nodes
- Updated `getMissingCoursesRecursive()` to handle COUNT nodes

### `/app/plan/page.tsx`
- Updated prerequisite warning state to include `detailedRequirements`
- Changed `semestersProblematicCourses` to store `RequirementMissing[]` instead of `string[]`
- Enhanced error messages to show detailed requirement descriptions
- Updated tooltip to display better formatted requirements

### `/app/actions.ts`
- Updated error fallback to include `detailedRequirements` field

## Example Usage

```typescript
// Check prerequisites
const result = checkPrerequisites(
  'CS 3100',
  ['CS 1110', 'MATH 1310'],
  ['CS 2100']
);

// Get simple missing courses (backward compatible)
console.log(result.missingCourses);
// Output: ['STAT 2020', 'STAT 2120'] 

// Get detailed requirements (new)
console.log(result.detailedRequirements);
// Output: [{
//   type: 'count',
//   description: 'Need 1 more of: STAT 2020, STAT 2120',
//   missingCourses: ['STAT 2020', 'STAT 2120'],
//   satisfiedCount: 0,
//   requiredCount: 1
// }]

// Display to user
const messages = result.detailedRequirements
  .map(req => req.description)
  .join('; ');
console.log(`Missing: ${messages}`);
// Output: "Missing: Need 1 more of: STAT 2020, STAT 2120"
```

## Backward Compatibility
The simple `missingCourses` array is still populated and can be used for existing code, but detailed requirements should be preferred for better user experience.
