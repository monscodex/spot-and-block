// This file manages the blocking of third party requests made from a specific site.
// It will only block them if the site has already been analysed and if blocking the third party requests is one of the site's blocking features.

"use strict";

function getDomainNameFromUrl(url) {
  let domainName;

  try {
    domainName = new URL(url).hostname;
  } catch (e) {
    return;
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  blockThirdPartyRequests,
  {
    urls: [],
    types: [],
  },
  ["blocking"]
);

function blockThirdPartyRequests(info) {
  // Return if it isn't a third party request
  if (info.initiator === undefined) {
    return;
  }

  const initiatorDomainName = getDomainNameFromUrl(info.initiator);
  const requestDomainName = getDomainNameFromUrl(info.url);

  if (initiatorDomainName === undefined || requestDomainName === undefined) {
    return;
  }

  // We don't want to block first party requests
  // when the initiatorDomainName === requestDomainName it means that it is a
  // request to the same domainName, to get different documents (images,
  // videos, other js)
  if (initiatorDomainName === requestDomainName) {
    return;
  }

  const haveToBlockThirdPartyRequests =
    needToBlockThirdParty(initiatorDomainName);
  if (haveToBlockThirdPartyRequests) {
    return { cancel: true };
  }
}
function needToBlockThirdParty(domainName) {
  let pageBlocker;
  try {
    pageBlocker = window.pageBlockers[domainName];
  } catch (error) {
    return false;
  }

  // The pageBlocker attribute exists while the tab is opened. If there is no
  // pageBlocker it means that the request wasn't made from an
  // open tab -> we aren't blocking it.
  if (pageBlocker === undefined) {
    return false;
  }

  const haveToBlockThirdPartyRequests =
    pageBlocker.currentBlockingMethods.includes("blockThirdPartyRequests");

  return haveToBlockThirdPartyRequests;
}
