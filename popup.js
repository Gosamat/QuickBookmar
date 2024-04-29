const searchInput = document.getElementById("searchInput");
const autocompleteList = document.getElementById("autocompleteList");

let bookmarks = [];
let selectedIndex = -1;

// Get bookmarks on load
chrome.bookmarks.getTree(function (bookmarksTree) {
  searchInput.focus();
  bookmarks = extractBookmarks(bookmarksTree[0].children);
  renderAutocomplete(bookmarks);
});

function extractBookmarks(bookmarkNodes) {
  const results = [];
  bookmarkNodes.forEach((node) => {
    if (node.children) {
      results.push(...extractBookmarks(node.children));
    } else {
      results.push(node.title);
    }
  });
  return results;
}

searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();
  const autocompleteResults = searchBookmarks(searchTerm);
  renderAutocomplete(autocompleteResults);
  selectedIndex = -1;
});

function searchBookmarks(searchTerm) {
  const matchingBookmarks = bookmarks.filter((bookmark) =>
    bookmark.toLowerCase().includes(searchTerm)
  );
  const remainingBookmarks = bookmarks.slice(matchingBookmarks.length);
  const topResults = matchingBookmarks.slice(0, 5);
  const remainingResults = remainingBookmarks.slice(0, 5 - topResults.length);
  return [...topResults, ...remainingResults];
}

function renderAutocomplete(autocompleteResults) {
  autocompleteList.innerHTML = "";
  autocompleteResults.slice(0, 5).forEach((result, index) => {
    // display the first 5 results
    const listItem = document.createElement("li");

    const maxLength = 50;
    listItem.textContent =
      result.length > maxLength
        ? result.substring(0, maxLength) + "..."
        : result;

    listItem.addEventListener("click", () => {
      navigateToBookmark(result);
    });
    if (index === selectedIndex) {
      listItem.classList.add("selected");
      searchInput.value = result;
    }
    autocompleteList.appendChild(listItem);
  });
}

searchInput.addEventListener("keydown", function (event) {
  const autocompleteResults = searchBookmarks(searchInput.value);

  if (event.key === "ArrowUp") {
    if (selectedIndex > 0) {
      selectedIndex--;
    }
    renderAutocomplete(autocompleteResults);
  } else if (event.key === "ArrowDown") {
    if (selectedIndex < autocompleteList.children.length - 1) {
      selectedIndex++;
    }
    renderAutocomplete(autocompleteResults);
  } else if (event.key === "Enter") {
    if (selectedIndex >= 0) {
      const selectedItem = autocompleteList.children[selectedIndex];
      navigateToBookmark(selectedItem.textContent);
    }
  }
});

function navigateToBookmark(bookmarkTitle) {
  chrome.bookmarks.search(bookmarkTitle, function (results) {
    if (results.length > 0) {
      const bookmarkUrl = results[0].url;

      chrome.tabs.query({ url: bookmarkUrl }, function (tabs) {
        if (tabs.length > 0) {
          chrome.tabs.update(tabs[0].id, { active: true });
        } else {
          chrome.tabs.create({ url: bookmarkUrl });
        }
      });
    }
  });
}
