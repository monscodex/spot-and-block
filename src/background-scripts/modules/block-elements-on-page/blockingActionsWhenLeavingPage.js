// This file contains the listeners that will trigger the blocking actions.
// These are executed when leaving the page.
// These blocking actions are called remotely, they are called from the popup when leaving the page.

"use strict";

import { clearCookies, clearCache } from "./backgroundDataClearing.js";

// Cookies clearing
chrome.runtime.onMessage.addListener((request) => {
  if (request.message !== "clearCookies") {
    return;
  }

  clearCookies(request.domainName);
});

// Cache clearing
chrome.runtime.onMessage.addListener((request) => {
  if (request.message !== "clearCache") {
    return;
  }

  clearCache();
});
