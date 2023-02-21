// This file manages the blocking side of the extension.
// It creates a pageBlocker instance for each site.
// This file also communicates with the popup to remote control the blocking made to each site.

"use strict";

import PageBlocker from "./page-blocker.js";
import { blockingMethods } from "./blocking-methods.js";

export default function blockElementsOnPage(
  analysedResults,
  domainName,
  tabId
) {
  window.pageBlockers[domainName] = new PageBlocker(domainName, tabId);
  window.pageBlockers[domainName].deduceWhatToBlock(analysedResults);
}

// Return the pageBlocker data to the popup
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message !== "getPageBlockerData") {
    return;
  }

  const domainName = request.domainName;
  const pageBlocker = await returnPageBlockerForDomain(domainName);

  const pageBlockerData = {
    analysed: pageBlocker.analysed,
    possibleBlockingMethods: blockingMethods,
    currentBlockingMethods: pageBlocker.currentBlockingMethods,
  };

  chrome.runtime.sendMessage({
    message: "hereIsThePageBlockerData",
    tabId: request.tabId,
    pageBlockerData,
  });
});

// Toggle a blocking method (asked by the popup)
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message !== "pageBlockerToggleMethod") {
    return;
  }

  const domainName = request.domainName;
  const methodName = request.methodName;

  window.pageBlockers[domainName].toggleMethod(methodName);
});

async function returnPageBlockerForDomain(domainName) {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let pageBlocker = undefined;
  do {
    await delay(100);

    try {
      pageBlocker = window.pageBlockers[domainName];
    } catch (error) {
      // the pageBlocker for that site doesn't exist yet
    }
  } while (pageBlocker === undefined);

  return pageBlocker;
}
