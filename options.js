document.addEventListener('DOMContentLoaded', () => {
  const backgroundColorInput = document.getElementById('background-color');
  const highlightColorInput = document.getElementById('highlight-color');
  const accordions = document.querySelectorAll(".accordion-btn");

  // Load saved colors
  chrome.storage.sync.get(['backgroundColor', 'highlightColor'], (result) => {
    if (result.backgroundColor) {
      backgroundColorInput.value = result.backgroundColor;
    }
    if (result.highlightColor) {
      highlightColorInput.value = result.highlightColor;
    }
  });

  // Save colors
  backgroundColorInput.addEventListener('input', () => {
    const backgroundColor = backgroundColorInput.value;
    chrome.storage.sync.set({ backgroundColor });
  });

  highlightColorInput.addEventListener('input', () => {
    const highlightColor = highlightColorInput.value;
    chrome.storage.sync.set({ highlightColor });
  });

  accordions.forEach((accordion) => {
    accordion.addEventListener("click", () => {
      const panel = accordion.nextElementSibling;
      panel.classList.toggle("active");

      if (panel.classList.contains("active")) {
        accordion.classList.add("active");
      } else {
        accordion.classList.remove("active");
      }
    });
  });

  // Update color preview on input change
  const backgroundPreview = document.getElementById("background-preview");
  backgroundColorInput.addEventListener("input", () => {
    backgroundPreview.style.backgroundColor = backgroundColorInput.value;
  });

  const highlightPreview = document.getElementById("highlight-preview");
  highlightColorInput.addEventListener("input", () => {
    highlightPreview.style.backgroundColor = highlightColorInput.value;
  });
});
