document.addEventListener("DOMContentLoaded", function () {
  // Get bookmarks and render them
  chrome.bookmarks.getTree(function (bookmarks) {
    renderBookmarks(bookmarks[0].children[0].children);
  });
});

function renderBookmarks(bookmarks) {
  const bookmarkList = document.getElementById("bookmarkList");

  bookmarks.forEach((bookmark) => {
    const listItem = document.createElement("li");
    listItem.textContent = bookmark.title;
    listItem.addEventListener("click", function () {
      chrome.tabs.create({ url: bookmark.url });
    });
    bookmarkList.appendChild(listItem);
  });
}
