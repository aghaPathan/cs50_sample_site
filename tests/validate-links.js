const fs = require("fs");
const path = require("path");

const HTML_FILES = ["index.html", "rules.html", "stages.html", "rankings.html"];
const ROOT = path.resolve(__dirname, "..");

let exitCode = 0;

// Collect all internal links across all pages
const allInternalLinks = new Set();
const navLinksPerPage = {};

HTML_FILES.forEach(function (file) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error("FAIL: " + file + " does not exist");
    exitCode = 1;
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];

  // Extract all href values
  var hrefPattern = /href=["']([^"']+)["']/gi;
  var match;
  var internalLinks = [];
  var externalLinks = [];

  while ((match = hrefPattern.exec(content)) !== null) {
    var href = match[1];

    // Skip anchors and empty
    if (href === "#" || href === "") {
      continue;
    }

    // External links (http/https or protocol-relative)
    if (/^(https?:)?\/\//i.test(href)) {
      externalLinks.push(href);
      continue;
    }

    // Internal links
    internalLinks.push(href);
    allInternalLinks.add(href);
  }

  // Check that internal linked files exist
  internalLinks.forEach(function (link) {
    // Strip query string and hash
    var cleanLink = link.split("?")[0].split("#")[0];
    var linkedPath = path.join(ROOT, cleanLink);
    if (!fs.existsSync(linkedPath)) {
      errors.push("Broken internal link: " + link);
    }
  });

  // Check that navigation bar contains all expected page links
  var navMatch = content.match(
    /<nav[\s\S]*?<\/nav>/i
  );
  if (navMatch) {
    var navContent = navMatch[0];
    var navLinks = [];
    var navHrefPattern = /href=["']([^"'#]+)["']/gi;
    while ((match = navHrefPattern.exec(navContent)) !== null) {
      navLinks.push(match[1]);
    }
    navLinksPerPage[file] = navLinks;

    HTML_FILES.forEach(function (expectedPage) {
      if (!navLinks.includes(expectedPage)) {
        errors.push("Navigation bar missing link to: " + expectedPage);
      }
    });
  } else {
    errors.push("No <nav> element found");
  }

  // Check external links have https (not http)
  externalLinks.forEach(function (link) {
    if (/^http:\/\//i.test(link)) {
      errors.push("Insecure HTTP link (should be HTTPS): " + link);
    }
  });

  if (errors.length > 0) {
    console.error("FAIL: " + file);
    errors.forEach(function (err) {
      console.error("  - " + err);
    });
    exitCode = 1;
  } else {
    console.log("PASS: " + file);
  }
});

// Cross-page consistency: navigation should be the same on all pages
var firstPageNav = navLinksPerPage[HTML_FILES[0]];
if (firstPageNav) {
  HTML_FILES.slice(1).forEach(function (file) {
    var pageNav = navLinksPerPage[file];
    if (pageNav && JSON.stringify(pageNav.sort()) !== JSON.stringify(firstPageNav.sort())) {
      console.error(
        "WARN: Navigation links differ between " + HTML_FILES[0] + " and " + file
      );
    }
  });
}

process.exit(exitCode);
