document.addEventListener('DOMContentLoaded', () => {
    const backgroundColorInput = document.getElementById('background-color');
    const highlightColorInput = document.getElementById('highlight-color');
  
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
  });
  