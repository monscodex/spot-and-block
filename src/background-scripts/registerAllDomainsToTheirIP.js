// This file contains a function that is going to register every domain name to its corresponding IP.
// We will need this information later in order to get information about a site.

"use strict";

function getDomainNameFromUrl(url) {
  let domainName;

  try {
    domainName = new URL(url).hostname;
  } catch (e) {
    return;
  }

  return domainName;
}

// This object associates the IP address of the website to the
// domain name in an early stage of the communication between the browser and
// the website (before the page is fully loaded)
window.DNtoIP = {};

/* NOTE: chrome.webRequest.onCompleted is called every time the browser makes a
  new http request (every time the user browses a new site).

  -> We want to associate the IP of the site to the domain name in the DNtoIP object
  */
chrome.webRequest.onCompleted.addListener(
  (info) => {
    const url = info.url;
    const ip = info.ip;

    const domainName = getDomainNameFromUrl(url);
    if (domainName === undefined) {
      return;
    }
    window.DNtoIP[domainName] = ip;
  },
  {
    urls: [],
    types: [],
  },
  []
);
