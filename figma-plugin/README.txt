NEXTROLE — FIGMA GENERATOR

Import manifest.json as a development plugin in a Figma desktop Design file.
Run Nextrole — Responsive Job Portal. The Inter font family is required
(Regular, Semi Bold, Bold). A new page is created; existing pages are preserved.

21 NATIVE, EDITABLE SCREENS
D1 listings; D2 design filter; D3 empty search; D4 role details;
D5 empty personal details; D6 filled details; D7 validation;
D8 experience empty; D9 experience filled; D10 review; D11 confirmation;
D12 saved role; D13 saved application draft.
M1 mobile listings; M2 filter example; M3 details; M4 personal details;
M5 experience; M6 review; M7 confirmation; M8 filtered design roles.

Desktop frames: 1440 x 1000. Mobile frames: 390 x 844.
Content extends below each frame with vertical prototype scrolling.
Two named flow starts are available in Present: desktop and mobile.

INTERACTIVE COMPONENTS
Button: primary/secondary, default/hover/disabled (6 variants).
Input: default/focus/error/filled (4 variants).
Checkbox: off/on (2 variants, click toggles).
Bookmark: off/on (2 variants, click toggles).
Step indicator: upcoming/current/done (3 variants).
Buttons use hover interactions; screen navigation uses 250 ms Smart Animate.
Auto Layout is used for navigation, cards, filters, fields, and page columns.

FLOW NOTES
The connected example role is Junior Product Designer at Luma Studio.
On desktop, selecting a personal-detail field opens the filled sample;
continuing from the empty form shows the validation state.
Resume controls open prepared sample-file states.
Mobile starts with prepared personal details and experience to demonstrate
the complete application flow without native text entry.
Filters, shortlist, and saved draft pages are illustrated states.
Component bookmark/checkbox toggles change their own appearance only;
they do not update data across screens. Use the browser prototype for
real filtering, persistence, typing, file selection, and local records.

VALIDATION LIMIT
TypeScript compilation and API-mock structural checks pass. The generator
has not been executed inside native Figma here. No .fig export or account
file is included. Run the plugin and inspect the resulting frames in Figma.

REBUILD
From the project root: npm ci, then npm run figma:build.
The compiled code.js is already included for direct import.
