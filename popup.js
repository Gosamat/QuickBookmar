let bookmarks = [];
let selectedAutocompleteIndex = -1;
let editMode = false;
let selectedBookmark = null;

document.addEventListener('DOMContentLoaded', function () {
  // Get bookmarks and render the search bar
  chrome.bookmarks.getTree(function (bookmarksTree) {
    bookmarks = extractBookmarks(bookmarksTree[0].children);
  });

  const searchInput = document.getElementById('searchInput');
  const autocompleteList = document.getElementById('autocompleteList');
  const editModeIndicator = document.getElementById('editModeIndicator');
  const renameInput = document.getElementById('renameInput');

  // Handle keyboard shortcuts
  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 't') {
      searchInput.focus();
    } else if (event.key === '/' && !editMode) {
      enterEditMode();
    } else if (autocompleteList.style.display === 'block') {
      if (event.key === 'ArrowDown') {
        navigateAutocomplete('down');
      } else if (event.key === 'ArrowUp') {
        navigateAutocomplete('up');
      } else if (event.key === 'Enter') {
        if (!editMode) {
          selectAutocomplete();
        } else {
          renameBookmark();
        }
      }
    }
  });

  // Handle search input
  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();
    const autocompleteResults = searchBookmarks(searchTerm);
    renderAutocomplete(autocompleteResults);
  });

  // Handle autocomplete item selection
  autocompleteList.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('autocomplete-item')) {
      selectedBookmark = event.target.textContent;
      if (!editMode) {
        navigateToBookmark(selectedBookmark);
      } else {
        renameInput.value = selectedBookmark;
        renameInput.style.display = 'block';
        renameInput.focus();
      }
    }
  });

  // Handle rename input blur
  renameInput.addEventListener('blur', function () {
    if (editMode) {
      renameBookmark();
    }
  });
});

function enterEditMode() {
  editMode = true;
  editModeIndicator.textContent = 'Edit mode activated';
}

function extractBookmarks(bookmarkNodes) {
  const result = [];
  bookmarkNodes.forEach(node => {
    if (node.children) {
      result.push(...extractBookmarks(node.children));
    } else {
      result.push(node.title);
    }
  });
  return result;
}

function searchBookmarks(searchTerm) {
  return bookmarks.filter(bookmark => bookmark.toLowerCase().includes(searchTerm));
}

function renderAutocomplete(autocompleteResults) {
  const autocompleteList = document.getElementById('autocompleteList');
  autocompleteList.innerHTML = '';
  if (autocompleteResults.length > 0) {
    autocompleteResults.forEach(result => {
      const autocompleteItem = document.createElement('div');
      autocompleteItem.classList.add('autocomplete-item');
      autocompleteItem.textContent = result;
      autocompleteList.appendChild(autocompleteItem);
    });
    autocompleteList.style.display = 'block';
    selectedAutocompleteIndex = -1;
  } else {
    autocompleteList.style.display = 'none';
  }
}

function navigateAutocomplete(direction) {
  const autocompleteItems = document.querySelectorAll('.autocomplete-item');
  if (direction === 'down') {
    selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, autocompleteItems.length - 1);
  } else if (direction === 'up') {
    selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
  }
  autocompleteItems.forEach((item, index) => {
    if (index === selectedAutocompleteIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function selectAutocomplete() {
  const autocompleteItems = document.querySelectorAll('.autocomplete-item');
  if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < autocompleteItems.length) {
    selectedBookmark = autocompleteItems[selectedAutocompleteIndex].textContent;
    if (!editMode) {
      navigateToBookmark(selectedBookmark);
    } else {
      renameInput.value = selectedBookmark;
      renameInput.style.display = 'block';
      renameInput.focus();
    }
  }
}

function renameBookmark() {
  const newName = renameInput.value.trim();
  if (newName !== '' && selectedBookmark) {
    chrome.bookmarks.search(selectedBookmark, function (results) {
      if (results.length > 0) {
        chrome.bookmarks.update(results[0].id, { title: newName }, function () {
          alert('Bookmark renamed successfully');
          exitEditMode();
        });
      }
    });
  }
}

function exitEditMode() {
  editMode = false;
  editModeIndicator.textContent = '';
  renameInput.value = '';
  renameInput.style.display = 'none';
  selectedBookmark = null;
}
