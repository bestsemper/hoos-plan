// test.js
// fast, simple test to verify regex and basic logic from content.js
// We will mock the environment since we are running in Node, not a browser.

const assert = require('assert');

// 1. Test Regex Logic
// The regex in content.js is: /\b([A-Z]{2,4})\s?(\d{4})\b/g;
const regex = /\b([A-Z]{2,4})\s?(\d{4})\b/g;

function testRegex(text) {
    regex.lastIndex = 0; // reset
    const matches = [...text.matchAll(regex)];
    return matches.map(m => m[0]);
}

console.log("Testing Regex...");

// Case A: Standard course code
const textA = "I am taking CS 1010 next semester.";
const matchesA = testRegex(textA);
assert.deepStrictEqual(matchesA, ['CS 1010'], 'Should match "CS 1010"');
console.log("PASS: CS 1010 matched");

// Case B: No space
const textB = "APMA2120 is hard.";
const matchesB = testRegex(textB);
assert.deepStrictEqual(matchesB, ['APMA2120'], 'Should match "APMA2120"');
console.log("PASS: APMA2120 matched");

// Case C: Multiple in one string
const textC = "CS 2100 and CS 2130 are core classes.";
const matchesC = testRegex(textC);
assert.deepStrictEqual(matchesC, ['CS 2100', 'CS 2130'], 'Should match multiple courses');
console.log("PASS: Multiple courses matched");

// Case D: Invalid/boundary
const textD = "CS 101 is not valid, nor is CS 10100. STS 1500 is valid.";
// CS 101 -> No match (only 3 digits)
// CS 10100 -> The regex `\b` at the end prevents matching 1010 inside 10100 IF it's a word boundary.
// Let's see how \b behaves with numbers.
const matchesD = testRegex(textD);
// "CS 101" -> "101" is 3 digits. Regex expects 4.
// "CS 10100" -> "1010" followed by "0". "0" is a word char, so \b should fail for "1010".
assert.ok(matchesD.includes('STS 1500'), 'Should match STS 1500');
assert.ok(!matchesD.includes('CS 101'), 'Should not match 3 digits');
assert.ok(!matchesD.includes('CS 10100'), 'Should not match 5 digits');
console.log("PASS: Boundary conditions checked");


console.log("\nAll logic tests passed.");
