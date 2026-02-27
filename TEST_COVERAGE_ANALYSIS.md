# Test Coverage Analysis

## Current State

The project currently has **zero automated tests**. There is no testing framework configured, no test files, and no coverage tooling. The only automated quality checks come from the CI pipeline (`.github/workflows/pr-checks.yml`), which performs syntax validation, secrets scanning, and basic security checks — but no functional or structural testing.

### Inventory of Testable Code

| File | Lines | Testable Surface |
|------|-------|-----------------|
| `index.html` | 51 | HTML structure, navigation, links, semantic markup |
| `rules.html` | 160 | HTML structure, navigation, images, content layout |
| `stages.html` | 71 | HTML structure, navigation, content sections |
| `rankings.html` | 1,512 | HTML structure, navigation, collapsible sections, data tables, button interactivity |
| `scripts.js` | 8 | `myFunction(id)` — toggle display of elements |
| `styles.css` | 39 | Layout rules, typography, footer positioning, background colors |

---

## Proposed Test Improvements

### 1. HTML Validation Tests (High Priority)

**Why:** `rankings.html` contains a critical structural issue — a nested `<html>` tag (line 2: `<html lang="en">` and line 3: `<html>`). This kind of bug would be caught by validation tests.

**What to test:**
- All 4 HTML files pass W3C HTML validation (no duplicate tags, proper nesting)
- Every page includes the required `<!DOCTYPE html>` declaration
- Every page has a `<title>` element
- Every page has a `lang` attribute on the root `<html>` element
- No unclosed or improperly nested tags

**Suggested tool:** [html-validate](https://html-validate.org/) or [Nu HTML Checker (vnu)](https://validator.github.io/validator/) via npm.

---

### 2. Navigation and Link Integrity Tests (High Priority)

**Why:** All four pages share a navigation bar with cross-links. Broken internal links would silently break the user experience, and there's no check for this today.

**What to test:**
- Every internal link (`index.html`, `rules.html`, `stages.html`, `rankings.html`) points to a file that exists
- The navigation bar is present on every page and contains all 4 page links
- External links (Wikipedia, etc.) use valid URL formats and HTTPS
- The navbar brand link (`href="#"`) is intentional or should point to `index.html`

**Suggested tool:** [linkinator](https://github.com/JustinBeckwith/linkinator) or a custom script using a local HTTP server + link checker.

---

### 3. JavaScript Unit Tests (High Priority)

**Why:** `scripts.js` contains a single function `myFunction(id)` that toggles the CSS `display` property of elements. Despite being small, this function has no tests and contains implicit behavior worth verifying.

**What to test:**
- Calling `myFunction(id)` on an element with `display: none` sets it to `display: block`
- Calling `myFunction(id)` on an element with `display: block` sets it to `display: none`
- Calling `myFunction(id)` on an element with no inline `display` style set (initial state) — the current code will go to the `else` branch and set `display: none`, which is likely a bug (the element starts visible, so the first click hides it instead of showing hidden content)
- Calling `myFunction` with a non-existent `id` throws a predictable error (currently it would throw a `TypeError` on `null.style`)

**Suggested tool:** [Jest](https://jestjs.io/) with [jsdom](https://github.com/jsdom/jsdom) for DOM simulation.

---

### 4. CSS Validation and Visual Regression Tests (Medium Priority)

**Why:** The CSS is simple today but has no validation. Changes could break layout (e.g. the footer positioning or responsive behavior) without anyone noticing.

**What to test:**
- `styles.css` passes CSS validation (no syntax errors, no unknown properties)
- The footer has a dark background and is positioned at the bottom
- Body background color is `#F1F1F1`
- The `.heading` class centers text
- Paragraph text within `div` elements is justified

**Suggested tool:** [stylelint](https://stylelint.io/) for CSS linting; screenshot comparison tools like [BackstopJS](https://github.com/garris/BackstopJS) for visual regression if needed.

---

### 5. Accessibility Tests (Medium Priority)

**Why:** The site uses Bootstrap's navbar but there is room to improve accessibility. Screen readers, keyboard navigation, and proper ARIA attributes are not being validated.

**What to test:**
- All images have `alt` attributes (rules.html contains many chess piece images)
- Color contrast ratios meet WCAG AA standards (dark footer text on dark background, etc.)
- The collapsible sections in `rankings.html` are keyboard-accessible
- Navigation landmarks and heading hierarchy are correct (`h1` → `h2` → `h3`, not skipping levels)
- Interactive elements (buttons) have accessible labels

**Suggested tool:** [axe-core](https://github.com/dequelabs/axe-core) via [pa11y](https://pa11y.org/) or Lighthouse CI.

---

### 6. Cross-Page Consistency Tests (Low Priority)

**Why:** The four pages were likely built independently and may drift in structure over time.

**What to test:**
- All pages include the same Bootstrap CSS version
- All pages include `styles.css` and `scripts.js`
- All pages have a consistent navbar structure
- All pages include a footer element
- The `<title>` is the same across all pages ("Chess World")

**Suggested tool:** Custom test script (e.g., using [cheerio](https://github.com/cheeriojs/cheerio) in Node.js to parse and assert on HTML structure).

---

### 7. Responsive / Mobile Layout Tests (Low Priority)

**Why:** The site uses Bootstrap's grid system (`col-md-9`) and responsive navbar (`navbar-expand-lg`), but there are no tests to verify the responsive behavior actually works.

**What to test:**
- The navbar collapses to a hamburger menu on small viewports
- Content is readable without horizontal scrolling on mobile widths (375px, 768px)
- Tables in `rankings.html` don't overflow their containers on small screens

**Suggested tool:** [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/) with viewport resizing.

---

## Bugs Found During Analysis

1. **Nested `<html>` tags in `rankings.html`** (line 2-3): The file contains `<html lang="en">` followed immediately by `<html>`. The second tag is invalid and should be removed.

2. **Initial toggle state mismatch in `scripts.js`**: The collapsible divs in `rankings.html` start with `style="display:none;"`, but the `myFunction` checks `=== "none"` against `element.style.display`. While this works for the inline style case, if someone removes the inline style and uses CSS instead, the function would break on the first click because `element.style.display` would be `""` (empty string), not `"none"`.

3. **No error handling in `myFunction`**: Passing an invalid `id` causes an uncaught `TypeError` (`Cannot read properties of null`).

---

## Recommended Implementation Order

| Priority | Test Category | Effort | Impact |
|----------|--------------|--------|--------|
| 1 | HTML Validation | Low | High — catches structural bugs like the nested `<html>` tag |
| 2 | Navigation / Link Integrity | Low | High — prevents broken user navigation |
| 3 | JavaScript Unit Tests | Low | High — the only dynamic code has zero coverage and potential bugs |
| 4 | CSS Validation | Low | Medium — prevents styling regressions |
| 5 | Accessibility | Medium | Medium — improves usability for all users |
| 6 | Cross-Page Consistency | Low | Low — catches structural drift |
| 7 | Responsive Layout | Medium | Low — verifies Bootstrap behavior |

---

## Suggested CI Integration

All proposed tests can be added as additional steps in the existing `.github/workflows/pr-checks.yml` pipeline. A minimal `package.json` would be needed to manage test dependencies:

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "html-validate": "^8.0.0",
    "stylelint": "^16.0.0",
    "linkinator": "^6.0.0"
  },
  "scripts": {
    "test": "jest",
    "validate:html": "html-validate *.html",
    "validate:css": "stylelint styles.css",
    "check:links": "linkinator *.html --skip '^http'"
  }
}
```
