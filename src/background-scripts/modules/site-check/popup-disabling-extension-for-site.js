// This file contains event listeners that make sure to enable or disable the
// extension for a site according to the user's interaction with the popup.

"use strict";

import { isExtensionDisabledForSite } from "./skipSiteCheck.js";

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.message !== "toggleExtensionActivationForSite") {
    return;
  }

  let callback;
  const domainName = request.domainName;
  const extensionDisabledInNewState = !isExtensionDisabledForSite(domainName);

  let toPush;
  if (extensionDisabledInNewState) {
    toPush = domainName;
    callback = (currentValue) => {
      currentValue.push(toPush);
    };
    delete window.pageBlockers[domainName];
  } else {
    toPush = `!${domainName}`;
    // This checks if a specific site is already disabled in the settings.
    // If there is, it is deleted.
    callback = (currentValue) => {
      const index = currentValue.indexOf(domainName);

      if (index === -1) {
        currentValue.push(toPush);
      } else {
        currentValue.splice(index, 1);
      }
    };
  }

  await window.deactivatedSitesInstance.changeStorageVariable(callback);

  chrome.tabs.reload(request.tabId);
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message !== "getExtensionActivationForSite") {
    return;
  }

  const extensionDisabledForSite = isExtensionDisabledForSite(
    request.domainName
  );

  chrome.runtime.sendMessage({
    message: "hereIsTheExtensionActivationForSite",
    extensionDisabledForSite,
    tabId: request.tabId,
  });
});
