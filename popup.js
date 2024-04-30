const searchInput = document.getElementById("searchInput");
const autocompleteList = document.getElementById("autocompleteList");

let bookmarks = [];
let selectedIndex = -1;
let autocompleteResults = [];

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
      results.push({ title: node.title, url: node.url }); // Include URL in results
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
    favicon.src = new URL("/favicon.ico", result.url).href; // Get favicon URL
    favicon.onerror = () => {
      favicon.src = "default_icon.png";
    }; // Use a default icon if favicon doesn't exist
    favicon.classList.add("favicon"); // Add class for styling
    listItem.appendChild(favicon);

    // Truncate result title if it exceeds max length
    const maxLength = 50;
    const textNode = document.createTextNode(
      result.title.length > maxLength
        ? result.title.substring(0, maxLength) + "..."
        : result.title
    );
    listItem.appendChild(textNode);

    listItem.addEventListener("click", () => {
      navigateToBookmark(result.title);
    });
    if (index === selectedIndex) {
      listItem.classList.add("selected");
      searchInput.value = result.title;
    }
    autocompleteList.appendChild(listItem);
  });
}

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    // Up arrow
    if (selectedIndex > 0) {
      selectedIndex--;
    }
  } else if (event.key === "ArrowDown") {
    // Down arrow
    if (selectedIndex < autocompleteResults.length - 1) {
      selectedIndex++;
    }
  } else if (event.key === "Enter") {
    // Enter key
    if (selectedIndex >= 0) {
      navigateToBookmark(autocompleteResults[selectedIndex].url);
    }
  }
  renderAutocomplete(autocompleteResults);
});

function navigateToBookmark(bookmarkTitle) {
  chrome.bookmarks.search(bookmarkTitle, function (results) {
    if (results.length > 0) {
      const bookmarkUrl = results[0].url;
      const bookmarkUrlWithoutProtocol = bookmarkUrl.replace(
        /^https?:\/\//,
        ""
      );

      chrome.tabs.query({}, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i].url) {
            const tabUrlWithoutProtocol = tabs[i].url.replace(
              /^https?:\/\//,
              ""
            );
            if (
              tabs[i].url === bookmarkUrl ||
              tabUrlWithoutProtocol === bookmarkUrlWithoutProtocol
            ) {
              chrome.tabs.update(tabs[i].id, { active: true });
              window.close();
              return;
            }
            window.close();
          }
        }
        chrome.tabs.create({ url: bookmarkUrl });
        window.close();
      });
    }
  });
}
