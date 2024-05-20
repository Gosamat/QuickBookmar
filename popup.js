// Create a style element for dynamic styles
const style = document.createElement("style");
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const autocompleteList = document.getElementById("autocompleteList");
  const backgroundColorInput = document.getElementById("background-color");
  const highlightColorInput = document.getElementById("highlight-color");

  let bookmarks = [];
  let selectedIndex = -1;
  let autocompleteResults = [];

  // Apply stored colors
  chrome.storage.sync.get(["backgroundColor", "highlightColor"], (result) => {
    if (result.backgroundColor) {
      document.body.style.backgroundColor = result.backgroundColor;
      style.innerHTML += `
        .search-container { background-color: ${result.backgroundColor}; }
        .search-bar { background-color: ${result.backgroundColor}; }
        .autocomplete-list { background-color: ${result.backgroundColor}; }
      `;
    }
    if (result.highlightColor) {
      style.innerHTML += `.autocomplete-list li.selected { background-color: ${result.highlightColor}; }`;
    }
  });

  // Get bookmarks on load
  chrome.bookmarks.getTree(function (bookmarksTree) {
    searchInput.focus();
    bookmarks = extractBookmarks(bookmarksTree[0].children);
    autocompleteResults = bookmarks;
    renderAutocomplete(bookmarks);
  });

  function extractBookmarks(bookmarkNodes) {
    const results = [];
    bookmarkNodes.forEach((node) => {
      if (node.children) {
        results.push(...extractBookmarks(node.children));
      } else {
        results.push({ title: node.title, url: node.url });
      }
    });
    return results;
  }

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    autocompleteResults = searchBookmarks(searchTerm);
    renderAutocomplete(autocompleteResults);
    selectedIndex = -1;
  });

  function searchBookmarks(searchTerm) {
    const matchingBookmarks = bookmarks.filter((bookmark) =>
      bookmark.title.toLowerCase().includes(searchTerm)
    );
    if (matchingBookmarks.length < 5) {
      const remainingBookmarks = bookmarks.filter(
        (bookmark) => !bookmark.title.toLowerCase().includes(searchTerm)
      );
      matchingBookmarks.push(
        ...remainingBookmarks.slice(0, 5 - matchingBookmarks.length)
      );
    }
    return matchingBookmarks.slice(0, 5);
  }

  function renderAutocomplete(autocompleteResults) {
    autocompleteList.innerHTML = "";
    autocompleteResults.slice(0, 5).forEach((result, index) => {
      const listItem = document.createElement("li");

      // Create favicon element
      const favicon = document.createElement("img");
      favicon.src = new URL("/favicon.ico", result.url).href;
      favicon.onerror = () => {
        favicon.src = "default_icon.png";
      };
      favicon.classList.add("favicon");
      listItem.appendChild(favicon);

      const maxLength = 50;
      const textNode = document.createTextNode(
        result.title.length > maxLength
          ? result.title.substring(0, maxLength) + "..."
          : result.title
      );
      listItem.appendChild(textNode);

      listItem.addEventListener("click", () => {
        navigateToBookmark(result.url);
      });
      if (index === selectedIndex) {
        listItem.classList.add("selected");
        searchInput.value = result.title;
        searchInput.selectionStart = searchInput.selectionEnd =
          searchInput.value.length;
      }
      autocompleteList.appendChild(listItem);
    });
  }

  searchInput.addEventListener("keydown", function (event) {
    if (
      searchInput === document.activeElement &&
      autocompleteResults.length > 0
    ) {
      if (event.key === "ArrowUp") {
        if (selectedIndex > 0) {
          selectedIndex--;
        }
        event.preventDefault();
      } else if (event.key === "ArrowDown") {
        console.log(autocompleteResults);
        if (selectedIndex < autocompleteResults.length - 1) {
          selectedIndex++;
        }
        event.preventDefault();
      } else if (event.key === "Enter") {
        // Enter key
        if (selectedIndex >= 0) {
          navigateToBookmark(autocompleteResults[selectedIndex].url);
        }
        event.preventDefault();
      }
      renderAutocomplete(autocompleteResults);
    }
  });

  function navigateToBookmark(bookmarkUrl) {
    const bookmarkUrlWithoutProtocol = bookmarkUrl.replace(/^https?:\/\//, "");
    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].url) {
          const tabUrlWithoutProtocol = tabs[i].url.replace(/^https?:\/\//, "");
          if (
            tabs[i].url === bookmarkUrl ||
            tabUrlWithoutProtocol === bookmarkUrlWithoutProtocol
          ) {
            chrome.tabs.update(tabs[i].id, { active: true });
            window.close();
            return;
          }
        }
      }
      chrome.tabs.create({ url: bookmarkUrl });
      window.close();
    });
  }
});
