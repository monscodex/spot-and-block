// This file contains a function that determines if the site check of a site
// can be skipped (e.g. if the extension is disabled for the site in the
// blocking options).

"use strict";

import doesStringMatchFullyMatchInArrayWithWildcards from "./isStringInArrayWithWildcards.js";

function skipSiteCheck(domainName) {
  // If the site is being automatically reloaded to toggle the JS state, do not analyse it!
  let skipSiteCheck = false;
  try {
    skipSiteCheck = window.skipSiteCheckSites.includes(domainName);

    if (skipSiteCheck) {
      // Delete this property because maybe the next time that the site is reloaded
      // it isn't to toggle a blocking property.
      const index = window.skipSiteCheckSites.indexOf(domainName);
      window.skipSiteCheckSites.splice(index, 1);
    }
  } catch {
    // The site hasn't been analysed yet
  }

  const extensionDisabledForSite = isExtensionDisabledForSite(domainName);

  skipSiteCheck = skipSiteCheck || extensionDisabledForSite;
  return skipSiteCheck;
}

function isExtensionDisabledForSite(domainName) {
  const extensionDisabledForSite =
    doesStringMatchFullyMatchInArrayWithWildcards(
      domainName,
      window.deactivateExtensionForSites,
      true
    );

  return extensionDisabledForSite;
}

export { skipSiteCheck, isExtensionDisabledForSite };
