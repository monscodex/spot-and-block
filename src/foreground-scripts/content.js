// This file is going to be executed on each opened site. It will send a
// message to the site-check.js asking to perform the site check for the
// respective website.

"use strict";

// Wait until the page is fully loaded
let loader = setInterval(() => {
  if (document.readyState !== "complete") return;
  clearInterval(loader);

  // We want to analyse the page
  chrome.runtime.sendMessage({ message: "performSiteCheck" });
}, 10);
