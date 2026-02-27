const fs = require("fs");
const path = require("path");

const HTML_FILES = ["index.html", "rules.html", "stages.html", "rankings.html"];
const ROOT = path.resolve(__dirname, "..");

let exitCode = 0;

HTML_FILES.forEach(function (file) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error("FAIL: " + file + " does not exist");
    exitCode = 1;
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];

  // Check DOCTYPE
  if (!/^<!DOCTYPE html>/i.test(content.trim())) {
    errors.push("Missing <!DOCTYPE html> declaration");
  }

  // Check for lang attribute on <html>
  if (!/<html[^>]*\slang="[^"]+"/i.test(content)) {
    errors.push('Missing lang attribute on <html> element');
  }

  // Check for <title> element
  if (!/<title>[^<]+<\/title>/i.test(content)) {
    errors.push("Missing or empty <title> element");
  }

  // Check for nested <html> tags (a known bug pattern)
  var htmlTagCount = (content.match(/<html[\s>]/gi) || []).length;
  if (htmlTagCount > 1) {
    errors.push(
      "Found " + htmlTagCount + " <html> tags (should be exactly 1)"
    );
  }

  // Check that <head> exists
  if (!/<head>/i.test(content)) {
    errors.push("Missing <head> element");
  }

  // Check that <body> exists
  if (!/<body>/i.test(content)) {
    errors.push("Missing <body> element");
  }

  // Check that styles.css is linked
  if (!/href=["']styles\.css["']/i.test(content)) {
    errors.push("Missing link to styles.css");
  }

  // Check that scripts.js is included
  if (!/src=["']scripts\.js["']/i.test(content)) {
    errors.push("Missing script src for scripts.js");
  }

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

process.exit(exitCode);
