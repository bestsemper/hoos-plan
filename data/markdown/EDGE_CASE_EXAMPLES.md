# Prerequisite Edge Cases

This file is a concise record of the prerequisite parsing behavior implemented so far against 9,433 UVA courses.

## Implemented

### Data structure
- Each course maps to a prerequisite tree.
- The tree uses:
  - `course` leaves for course codes
  - `AND`, `OR`, and `count` nodes with `children`
  - `major`, `program`, `year`, and `school` leaves for profile-gated restrictions

### Course logic
- Repeated department shorthand is expanded, so text like `PHYS 1720 or 2410 or 2415` becomes three full course nodes.
- Self-references are pruned when a course description mentions its own code.

### Mixed operators
- Comma-separated lists default to `OR`.
- Explicit `, and` and `, or` are preserved before generic comma handling.
- This fixes mixed expressions such as `PHYS 1720 or 2410 or 2415, and MATH 2310`, which now serialize as `AND(OR(...), MATH 2310)`.

### Equivalent-course handling
- Mapped equivalent courses are applied universally during prerequisite extraction and prerequisite checking, even when the catalog text does not explicitly say `or equivalent`.
- Catalog-derived equivalents come from cross-listed courses and exact title matches.
- Manual overrides live in [data/manual_equivalent_groups.json](data/manual_equivalent_groups.json).
- Verified examples:
  - `APMA 2130` becomes `OR(APMA 1110, MATH 1320)`.
  - `APMA 3110` becomes `OR(APMA 2120, MATH 2310, MATH 2315)`.
  - `MATH 2310` becomes `OR(MATH 1320, APMA 1110)`.
  - `MATH 3310` can be satisfied by `APMA 1110` because `MATH 1320` and `APMA 1110` are mapped as equivalent courses.

### Source merging
- Requirements are extracted from both course description text and enrollment requirements.
- The final tree is the union of both sources after dedupe, so restrictions present in only one source are still kept.
- Example: `STS 4500` keeps both the STS coursework and the `4th year` plus engineering-school restriction.

### Non-course enrollment requirements
- Enrollment text is also parsed into profile-gated nodes:
  - `major`
  - `program`
  - `year`
  - `school`
- School aliases are canonicalized, including SEAS, CLAS, McIntire, Darden, Batten, SCPS, SDS, EHD, Law, Medicine, Nursing, and Architecture.
- Restricted-to clauses, standing requirements, and school restrictions are deduped and normalized.

### Permission and restriction cleanup
- Instructor-permission tails are ignored when they only waive a prerequisite.
- Anti-requisite and restriction tails such as `can't enroll if`, `credit not granted`, and `not open to` are removed from prerequisite extraction.

## Current Limits

- Only real mapped course alternatives are expanded. Generic cases like AP credit, transfer credit, placement, or unnamed background knowledge are still left as the base course node.
- Corequisites are still treated as extracted course text, not a distinct `corequisite` node type.
- General education, total-credit, and other academic progress rules are not yet modeled as dedicated node types.

## Maintenance Notes

- Update [data/manual_equivalent_groups.json](data/manual_equivalent_groups.json) to add curated equivalency groups that title matching will not find.
- After changing parser behavior or manual equivalency groups, regenerate [data/uva_prerequisites.json](data/uva_prerequisites.json) with `scripts/extract_prerequisites.py`.