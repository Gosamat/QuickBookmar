document.addEventListener("DOMContentLoaded", function () {
  // Get bookmarks and render them
  chrome.bookmarks.getTree(function (bookmarks) {
    renderBookmarks(bookmarks[0].children[0].children);
  });

  // Handle keyboard shortcuts
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      window.close(); // Close the popup when pressing Esc
    }
  });

  // Handle search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    filterBookmarks(searchTerm);
  });
});

function renderBookmarks(bookmarks) {
  const bookmarkList = document.getElementById("bookmarkList");

  bookmarks.forEach((bookmark) => {
    const listItem = document.createElement("li");
    listItem.textContent = bookmark.title;
    listItem.setAttribute("data-url", bookmark.url); // Store URL as data attribute
    listItem.addEventListener("click", function () {
      chrome.tabs.create({ url: bookmark.url });
    });
    bookmarkList.appendChild(listItem);
  });
}

function filterBookmarks(searchTerm) {
  const bookmarkList = document.getElementById("bookmarkList");
  const bookmarks = Array.from(bookmarkList.getElementsByTagName("li"));

  bookmarks.forEach((bookmark) => {
    const title = bookmark.textContent.toLowerCase();
    const url = bookmark.getAttribute("data-url").toLowerCase();
    if (title.includes(searchTerm) || url.includes(searchTerm)) {
      bookmark.style.display = "block"; // Show matching bookmarks
    } else {
      bookmark.style.display = "none"; // Hide non-matching bookmarks
    }
  });
}
