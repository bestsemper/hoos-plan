# Prerequisite Edge Cases

This file is a concise record of the prerequisite parsing behavior implemented so far against 9,433 UVA courses.

## Implemented

### Course logic
- Plain course prerequisites are parsed into `course`, `AND`, `OR`, and `count` nodes.
- Repeated department shorthand is expanded, so text like `PHYS 1720 or 2410 or 2415` becomes three full course nodes.
- Self-references are pruned when a course description mentions its own code.

### Mixed operators
- Comma-separated lists default to `OR`.
- Explicit `, and` and `, or` are preserved before generic comma handling.
- This fixes mixed expressions such as `PHYS 1720 or 2410 or 2415, and MATH 2310`, which now serialize as `AND(OR(...), MATH 2310)`.

### Equivalent-course handling
- `or equivalent` is now expanded when the local clause explicitly allows an equivalent.
- Catalog-derived equivalents come from cross-listed courses and exact non-generic title matches.
- Manual overrides live in [data/manual_equivalent_groups.json](data/manual_equivalent_groups.json).
- Current manual groups cover the APMA/MATH calculus sequence:

```json
{
  "groups": [
    ["APMA 1090", "MATH 1310"],
    ["APMA 1110", "MATH 1320"],
    ["APMA 2120", "MATH 2310", "MATH 2315"]
  ]
}
```

- Verified examples:
  - `APMA 2130` becomes `OR(APMA 1110, MATH 1320)`.
  - `APMA 3110` becomes `OR(APMA 2120, MATH 2310, MATH 2315)`.
  - `MATH 2310` becomes `OR(MATH 1320, APMA 1110)`.

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

- `or equivalent` only expands when there is a real mapped course alternative. Generic cases like AP credit, transfer credit, placement, or unnamed background knowledge are still left as the base course node.
- Corequisites are still treated as extracted course text, not a distinct `corequisite` node type.
- General education, total-credit, and other non-course academic progress requirements are not yet modeled as dedicated node types.

## Maintenance Notes

- Update [data/manual_equivalent_groups.json](data/manual_equivalent_groups.json) to add curated equivalency groups that title matching will not find.
- After changing parser behavior or manual equivalency groups, regenerate [data/uva_prerequisites.json](data/uva_prerequisites.json) with `scripts/extract_prerequisites.py`.