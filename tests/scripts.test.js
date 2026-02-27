/**
 * @jest-environment jsdom
 */

const { toggleSection, myFunction } = require("../scripts");

describe("toggleSection", function () {
  beforeEach(function () {
    document.body.innerHTML = "";
  });

  test("shows a hidden element", function () {
    document.body.innerHTML = '<div id="section1" style="display:none;">Content</div>';
    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("block");
  });

  test("hides a visible element", function () {
    document.body.innerHTML = '<div id="section1" style="display:block;">Content</div>';
    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("none");
  });

  test("hides an element with no inline display style", function () {
    document.body.innerHTML = '<div id="section1">Content</div>';
    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("none");
  });

  test("toggles back and forth correctly", function () {
    document.body.innerHTML = '<div id="section1" style="display:none;">Content</div>';

    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("block");

    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("none");

    toggleSection("section1");
    expect(document.getElementById("section1").style.display).toBe("block");
  });

  test("does not throw when element does not exist", function () {
    expect(function () {
      toggleSection("nonexistent");
    }).not.toThrow();
  });

  test("returns undefined for nonexistent element", function () {
    var result = toggleSection("nonexistent");
    expect(result).toBeUndefined();
  });
});

describe("myFunction (backward compatibility)", function () {
  test("delegates to toggleSection", function () {
    document.body.innerHTML = '<div id="test" style="display:none;">Content</div>';
    myFunction("test");
    expect(document.getElementById("test").style.display).toBe("block");
  });
});
