chrome.commands.onCommand.addListener(function (command) {
  if (command === "open-search") {
    chrome.action.getPopup({}).then((popupInfo) => {
      if (popupInfo && popupInfo.popup) {
        // Check if popupInfo and popupInfo.popup are both defined
        chrome.action.setPopup({ popup: popupInfo.popup });
      }
    });
  }
});
