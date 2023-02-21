// Block the website's javascript either because the site hasn't been analysed
// yet or because it was analysed and blocking the site's javascript is one of the blocking features.

"use strict";

import { isExtensionDisabledForSite } from "../site-check/skipSiteCheck.js";

// Block the page JS before getting the page analysed
chrome.webRequest.onHeadersReceived.addListener(
  blockPageJS,
  {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame", "sub_frame"],
  },
  ["blocking", "responseHeaders"]
);

// Block the javascript while the blockElementsOnPage isn't finished
function blockPageJS(details) {
  let domainName;
  try {
    domainName = new URL(details.url).hostname;
  } catch (e) {
    return;
  }

  let responseHeaders = details.responseHeaders;

  const blockJS = needToBlockJS(domainName);
  if (!blockJS) {
    return;
  }

  // This is the way to disable javascript
  responseHeaders.push({
    name: "Content-Security-Policy",
    value: "script-src 'none';",
  });

  return { responseHeaders };
}

function needToBlockJS(domainName) {
  let blockJS;
  try {
    blockJS =
      window.pageBlockers[domainName].currentBlockingMethods.includes(
        "blockJS"
      );
  } catch (error) {
    // if the website has been analysed the property .analysed for the page
    // exists and we can make the comparison. We want to block the javascript
    // while the website hasn't been analysed.
    blockJS = true;
  }

  const extensionDisabledForSite = isExtensionDisabledForSite(domainName);
  const extensionActivatedForSite = !extensionDisabledForSite;

  return blockJS && extensionActivatedForSite;
}
