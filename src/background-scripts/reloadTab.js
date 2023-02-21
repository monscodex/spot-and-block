// This file contains a function that reloads a specific tab.
// This is a separated function because we need a background script to reload a
// tab. The extension's option page is going to request reloading its tab
// because it can't do it on itself.

"use strict";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message !== "reloadTab") {
    return;
  }

  chrome.tabs.reload(sender.tab.id);
});
