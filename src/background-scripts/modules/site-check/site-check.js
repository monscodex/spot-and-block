// This is the key file of the scripts running in the background.
// This file organizes three main actions: SITE CHECK, ANALYSIS OF SITE's INFORMATION and FEATURE BLOCKING.
//
// SITE CHECK: The site check is the retrieval of the website's information by
// API calls of external services (calls contained in files: shodan.js,
// virusTotal.js, cve.js, reverseGeolocation.js)
// This file uses the function from ./skipSiteCheck.js to determine if a site check is needed for the site.
// If a site check is needed it will perform the retrieval of information.
// If a site check isn't needed it will keep the original site information.
//
// ANALYSIS OF INFORMATION: Once the site information is retrieved, it is
// analysed (using analyse-data.js).
//
// FEATURE BLOCKING: It calls the function blockElementsOnPage (defined in
// block.js) to manage the blocking of the site's features.

"use strict";

import ShodanAPI from "../API-requests/shodan.js";
import VirusTotalAPI from "../API-requests/virusTotal.js";
import analyse from "../analyse-data/analyse-data.js";
import blockElementsOnPage from "../block-elements-on-page/block.js";

import waitUntilOptionsLoaded from "../waitUntilOptionsLoaded.js";
import {
  UpdatedVariable,
  VariableThatWillUpdateStorage,
} from "../updateVariableToSavedVariable.js";

import { skipSiteCheck } from "./skipSiteCheck.js";
import doesStringMatchFullyMatchInArrayWithWildcards from "./isStringInArrayWithWildcards.js";

import { alertCouldNotEffectuateSiteCheck } from '../error-alerting.js'

async function main() {
    await waitUntilOptionsLoaded();

    window.shodanAPI = new ShodanAPI();
    window.virusTotalAPI = new VirusTotalAPI();

    window.pageBlockers = {};
    window.skipSiteCheckSites = [];

    // In this object is stored all the information about the sites like their
    // IP, their API results, their analysis, etc
    new VariableThatWillUpdateStorage(window, "sites");

    // This array contains the list of important sites that will be checked
    // everytime the site is visited because it is an important site (e.g.
    // authentication pages, etc).
    new UpdatedVariable(window, "importantSites", "options.important-urls");

    // This array contains the list of important sites that will be checked
    // everytime the site is visited because it is an important site (e.g.
    // authentication pages, etc).
    window.deactivatedSitesInstance = new UpdatedVariable(
      window,
      "deactivateExtensionForSites",
      "options.deactivate-extension-for-urls"
    );

    // If the extension has to analyse the information and the domain is not contained in the
    // window.importantSites (the site isn't important), the site will be re-checked
    // after a period of time after the last analysis defined by the variable below.
    new UpdatedVariable(
      window,
      "unimportantSitesTimeout",
      "options.unimportant-sites-timeout"
    );

    performAllTheSiteChecksNeeded();
}

function performAllTheSiteChecksNeeded() {
  /* NOTE: This function is called everytime the user visits a new site (called
     from the content script)
  */
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.message !== "performSiteCheck") {
        return;
      }

      // Get the domain name and the ip of the connection
      const url = sender.tab.url;
      let domainName;
      try {
        domainName = new URL(url).hostname;
      } catch (e) {
        return;
      }
      const ip = window.DNtoIP[domainName]; // See ../../registerAllDomainsToTheirIP.js

      // We may want to skip the site check
      if (skipSiteCheck(domainName)) {
        return;
      }

      // This function returns multiple values because we need those values
      // for the rest of the code and it has already calculated them.
      const informationResults = getInfoAboutSite(ip, domainName, sender);

      if (informationResults === undefined) {
        chrome.tabs.reload(sender.tab.id);
        return;
      }

      const [needToParseTheSite, urlIsImportant, currentDate] =
        informationResults;

      let results;
      if (needToParseTheSite) {
        results = await parseWebsite(ip, domainName);

        saveResults({ ip, domainName, currentDate, urlIsImportant }, results);
      } else {
        results = window.sites[domainName].results;
      }

      // Could not parse site
      if (results === undefined) {
        alertCouldNotEffectuateSiteCheck()
        return
      }


      // We want to analyse the data retrieved to determine the blocking actions that will be executed.
      // NOTE: we're re-analysing the data even if we already fetched the
      // results because the analyse options may have changed
      const analysedResults = await analyse(domainName, results);
      window.sites[domainName].analysed = analysedResults;

      console.log(domainName, { analysedResults, results });

      blockElementsOnPage(analysedResults, domainName, sender.tab.id);
    }
  );
}

async function parseWebsite(ip, domainName) {
  let shodanResults = window.shodanAPI.parseIP(ip);
  let virusTotalResults = window.virusTotalAPI.completeCheckUrl(domainName);

  const allResults = await Promise.all([shodanResults, virusTotalResults]);

  [shodanResults, virusTotalResults] = [ ...allResults ];

  let results = shodanResults

  // The Shodan results are mandatory for the extension to work
  if (shodanResults === undefined) {
        return
  }

  if (virusTotalResults !== undefined) {
    results.scannedResults = virusTotalResults;
  }

  return results;
}

function saveResults(informationAboutWebsite, results) {
  if (results === undefined) {
    return
  }

  const { ip, domainName, currentDate, urlIsImportant } =
    informationAboutWebsite;

  window.sites[domainName] = {
    ip,
    results,
  };

  /* Note on the dateChecked property
      -> If the site isn't important we will assign a dateChecked
        property to know when to analyse it again.
      -> If the site is important there will be no such property as we
        will check it every time we will visit it
    */
  if (!urlIsImportant) {
    window.sites[domainName].dateChecked = currentDate;
  }
}

function getInfoAboutSite(ip, domainName, sender) {
  /* We want to re-check the site if:
    -> the site IS in the importantSites array (So we will check it every time we encounter it)
    -> the site has been checked in the past but it is time to check it again
    -> it's the first time we encounter the site
  */

  const domainNameIsImportant = isDomainNameImportant(domainName);

  // Get the current time (the number of milliseconds since January 01, 1970,
  // 00:00:00 UTC) (https://www.w3schools.com/js/js_dates.asp)
  const date = new Date();
  const currentDate = date.getTime();

  // domainNameEncountered should always be true but we define it to prevent errors
  const domainNameEncountered = ip !== undefined;
  if (!domainNameEncountered) {
    // Reload the tab to restart the process
    chrome.tabs.reload(sender.tab.id);
  } else {
    let firstTimeUrlEncountered = window.sites[domainName] === undefined;

    // It is stored in days -> calculate it in milliseconds
    const unimportantSitesTimeoutInMs =
      window.unimportantSitesTimeout * 1000 * 60 * 60 * 24;

    // I decided to calculate the timeout on the go and not to store it to be
    // able to change the unimportantSitesTimeout.
    const domainNameTimeout = firstTimeUrlEncountered
      ? null
      : window.sites[domainName].dateChecked + unimportantSitesTimeoutInMs;

    // The site has been encountered but it's time to check it again
    const timeToCheckTheSiteAgain =
      !firstTimeUrlEncountered && currentDate > domainNameTimeout;

    let needToParseTheSite =
      domainNameIsImportant ||
      timeToCheckTheSiteAgain ||
      firstTimeUrlEncountered;

    return [needToParseTheSite, domainNameIsImportant, currentDate];
  }
}

function isDomainNameImportant(domainName) {
  const domainNameIsImportant = doesStringMatchFullyMatchInArrayWithWildcards(
    domainName,
    window.importantSites
  );

  return domainNameIsImportant;
}

main();