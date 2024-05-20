chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case "open-search":
      chrome.windows.getCurrent(function (currentWindow) {
        // Get current window's width and height
        const screenWidth = currentWindow.width;
        const screenHeight = currentWindow.height;

        // Calculate left and top properties
        const left = Math.round((screenWidth - 500) / 2);
        const top = Math.round((screenHeight - 270) / 2);

        // Create new window
        chrome.windows.create({
          url: "popup.html",
          type: "popup",
          width: 500,
          height: 260,
          left: left,
          top: top,
        });
      });
      break;
    default:
      console.log(`Command ${command} not found`);
  }
});
