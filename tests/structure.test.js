const fs = require("fs");
const path = require("path");

const HTML_FILES = ["index.html", "rules.html", "stages.html", "rankings.html"];
const ROOT = path.resolve(__dirname, "..");

function readFile(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

describe("HTML structure", function () {
  HTML_FILES.forEach(function (file) {
    describe(file, function () {
      var content;

      beforeAll(function () {
        content = readFile(file);
      });

      test("has DOCTYPE declaration", function () {
        expect(content.trim()).toMatch(/^<!DOCTYPE html>/i);
      });

      test("has lang attribute on html element", function () {
        expect(content).toMatch(/<html[^>]*\slang="[^"]+"/i);
      });

      test("has exactly one <html> tag", function () {
        var matches = content.match(/<html[\s>]/gi) || [];
        expect(matches.length).toBe(1);
      });

      test("has a title element", function () {
        expect(content).toMatch(/<title>[^<]+<\/title>/i);
      });

      test("links to styles.css", function () {
        expect(content).toMatch(/href=["']styles\.css["']/);
      });

      test("includes scripts.js", function () {
        expect(content).toMatch(/src=["']scripts\.js["']/);
      });

      test("includes Bootstrap CSS", function () {
        expect(content).toMatch(/bootstrap/i);
      });

      test("has a navigation bar", function () {
        expect(content).toMatch(/<nav[\s>]/i);
      });

      test("has a footer", function () {
        expect(content).toMatch(/class=["']footer["']/i);
      });

      test("navigation links to all pages", function () {
        HTML_FILES.forEach(function (page) {
          expect(content).toContain('href="' + page + '"');
        });
      });
    });
  });
});

describe("CSS file", function () {
  var css;

  beforeAll(function () {
    css = readFile("styles.css");
  });

  test("exists and is non-empty", function () {
    expect(css.length).toBeGreaterThan(0);
  });

  test("sets body background color", function () {
    expect(css).toMatch(/body[\s\S]*?background-color\s*:/);
  });

  test("defines footer styles", function () {
    expect(css).toMatch(/\.footer[\s\S]*?\{/);
  });

  test("defines heading styles", function () {
    expect(css).toMatch(/\.heading[\s\S]*?\{/);
  });
});

describe("JavaScript file", function () {
  var js;

  beforeAll(function () {
    js = readFile("scripts.js");
  });

  test("exists and is non-empty", function () {
    expect(js.length).toBeGreaterThan(0);
  });

  test("defines toggleSection function", function () {
    expect(js).toMatch(/function\s+toggleSection/);
  });

  test("defines myFunction for backward compatibility", function () {
    expect(js).toMatch(/function\s+myFunction/);
  });

  test("uses strict mode", function () {
    expect(js).toMatch(/["']use strict["']/);
  });
});

describe("File existence", function () {
  var allFiles = HTML_FILES.concat(["styles.css", "scripts.js"]);

  allFiles.forEach(function (file) {
    test(file + " exists", function () {
      var filePath = path.join(ROOT, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
