// This file allows to have a centralized way of fetching the blocking methods.
// It contains the name and description of every blocking feature that appears in the settings and the pop-up's hypertext.

"use strict";

const blockingMethods = [
  {
    name: "deleteCookiesOnLeave",
    description: "Delete the site’s cookies when closing it",
  },
  {
    name: "deleteOtherTypesOfStorageOnLeave",
    description: "Delete the site’s storage once closed",
  },
  {
    name: "blockCookiesForSite",
    description: "Block cookies for the site",
  },
  {
    name: "blockOtherTypesOfStorageForSite",
    description:
      "Block other types of storage for the site (cache, session, local and indexedDataBase storage)",
  },
  {
    name: "blockThirdPartyRequests",
    description:
      "Block the requests made to other sites (third parties). Some of the website’s functionality depend on third party requests. By blocking them we would be preventing getting malware from an untrusted service. Blocking third party requests would lead to safer browsing but would sacrifice some features",
  },
  {
    name: "blockJS",
    description:
      "Block the site’s javascript. A large part of the website’s functionality depends on javascript. It is also the biggest threat if hackers have infected the website with malware. Blocking the javascript would lead to safer browsing but would sacrifice some features",
  },
  {
    name: "closeSitePromptly",
    description: "Close the site now!",
  },
];

let blockingOptionDescription = `<b>Once a site is sorted into this category the following blocking actions will be executed (one per line):</b>

Currently supported actions are:`;

let remaining = blockingMethods.length;
blockingMethods.forEach((blockingMethod) => {
  remaining--;

  blockingOptionDescription += `\n<b>${blockingMethod.name}</b>: ${
    blockingMethod.description
  }${remaining === 0 ? "." : ","}`;
});

export { blockingOptionDescription, blockingMethods };
