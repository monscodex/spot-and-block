// This file provides background data clearing methods.
// These are on a separate file because they are used in both the main
// pageBlocker instance (class defined in ./page-blocker.js) and the
// blockingActionsWhenLeavingPage.js

"use strict";

function clearCookies(domainName) {
  const domain = "." + domainName;

  // Get all cookies, and delete them one by one
  chrome.cookies.getAll({ domain }, (cookies) => {
    cookies.forEach((cookie) => {
      // Create the full url needed to delete the cookie
      const url = `http${cookie.secure ? "s" : ""}://${cookie.domain}${
        cookie.path
      }`;

      // Delete the cookie
      chrome.cookies.remove({
        url,
        name: cookie.name,
      });
    });
  });
}

function clearCache() {
  chrome.browsingData.removeCache({});
}

export { clearCookies, clearCache };
