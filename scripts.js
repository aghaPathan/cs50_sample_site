"use strict";

function toggleSection(id) {
  var element = document.getElementById(id);
  if (!element) {
    return;
  }
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

// Keep backward compatibility with existing onclick handlers
function myFunction(id) {
  return toggleSection(id);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { toggleSection, myFunction };
}
