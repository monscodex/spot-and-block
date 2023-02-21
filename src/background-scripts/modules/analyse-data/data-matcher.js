// This file declares the DataMatcher class that will take the parsed data as an input.
// - The checkForMatch method will match a category to the site according to the set 'spot' options (it uses the class input data).
// - The deduceWhatToBlock method will deduce what features to block according to the site's category and the set blocking options.

"use strict";

import areValuesEqual from "../../../components/compareValues.js";

export default class DataMatcher {
  constructor(data) {
    this.data = data;
  }

  async checkForMatch() {
    // The conditionsArray is structured in the following way
    // [
    //   [
    //   "low-risk", {
    //     "first-key": 0,
    //     "second-key": 0,
    //   }],
    //   ["medium", {
    //     "first-key": 0,
    //     "second-key": 0,
    //   }],
    //   ["critical", {
    //     "first-key": 0,
    //     "second-key": 0,
    //   }]
    // ]
    const conditionsArray = this.getListOfConditions();

    let match = null;
    for (const [category, conditions] of conditionsArray) {
      if (match !== null) {
        continue;
      }

      let results = await this.theDataMatchesTheCategory(conditions);
      if (results === null) {
        continue;
      }

      match = results;
      match.match = category;
    }

    this.match = match;
    return match;
  }

  deduceWhatToBlock() {
    if (this.match === null) {
      this.whatToBlock = [];
      return [];
    }

    const categoryMatch = this.match.match;

    this.whatToBlock =
      window.whatToBlockPerCategory[categoryMatch]["what-to-block"];

    return this.whatToBlock;
  }

  getListOfConditions() {
    // window.blockConditions will have the following form:
    // We loop through the keys and the conditions-per keys from the most dangerous
    // to the least dangerous
    // {
    //   "low-risk": {
    //     "first-key": 0,
    //     "second-key": 0,
    //   },
    //   "medium": {
    //     "first-key": 0,
    //     "second-key": 0,
    //   },
    //   "critical": {
    //     "first-key": 0,
    //     "second-key": 0,
    //   }
    // }
    const categoriesOrder = ["critical", "medium", "low-risk"];

    const conditionsList = categoriesOrder.map((category) => [
      category,
      window.blockConditions[category],
    ]);

    return conditionsList;
  }

  async theDataMatchesTheCategory(conditions) {
    const methodsToCall = [
      this.matchBecauseOfScanResults,
      this.matchBecauseOfNumberOfScans,
      this.matchBecauseOfLocationOfServer,
      this.matchBecauseOfMatchingServerTag,
      this.matchBecauseOfMaxCvss,
      this.matchBecauseOfCveAge,
      this.matchBecauseOfNumberOfServerOpenPorts,
    ];

    let match = null;
    for (const methodToCall of methodsToCall) {
      if (match !== null) {
        continue;
      }

      // results = {match: false, additionalMessageInformation: hi}
      const results = await methodToCall(this.data, conditions);
      if (results === undefined) {
        continue;
      }

      if (results.match) {
        match = { matchingMethodName: methodToCall.name, ...results };
      }
    }

    return match;
  }

  matchBecauseOfCveAge(data, conditions) {
    const CVEs = data.CVEs;

    if (CVEs === undefined) {
      return false;
    }

    let oldestCVEYear = new Date().getFullYear() * 100000;
    CVEs.forEach((cve) => {
      // Get the CVE year
      const cveName = cve.cve;
      let currentCveYear = cveName.slice(4, 8);
      currentCveYear = parseInt(currentCveYear);

      if (currentCveYear < oldestCVEYear) {
        oldestCVEYear = currentCveYear;
      }
    });

    let maxSupportedYear = new Date().getFullYear();
    maxSupportedYear -= conditions["cve-year-detector-value"];

    return {
      match: maxSupportedYear >= oldestCVEYear,
      additionalMessageInformation: oldestCVEYear,
    };
  }

  matchBecauseOfMaxCvss(data, conditions) {
    const CVEs = data.CVEs;

    if (CVEs === undefined) {
      return false;
    }

    let maxCvss = 0;
    CVEs.forEach((cve) => {
      const cvss = cve.cvss;

      if (cvss > maxCvss) {
        maxCvss = cvss;
      }
    });

    const maxSupportedCvss = conditions["cvss-detector-value"];

    return {
      match: maxSupportedCvss <= maxCvss,
      additionalMessageInformation: maxCvss,
    };
  }
  matchBecauseOfNumberOfScans(data, conditions) {
    let scans = data.scannedResults;

    // Just checking
    if (scans === undefined || areValuesEqual(scans, {})) {
      return false;
    }

    scans = scans.scans;
    const scanLength = Object.keys(scans).length;

    const maxSupportedNumberOfScans = conditions["number-of-suspicious-scans"];

    return {
      match: scanLength >= maxSupportedNumberOfScans,
      additionalMessageInformation: scanLength,
    };
  }

  async matchBecauseOfLocationOfServer(data, conditions) {
    const countryName = data.location.country;
    if (countryName === undefined) {
      return;
    }

    const forbiddenCountries = conditions["server-located-in-country"];
    const forbiddenLocation = forbiddenCountries.includes(countryName);

    return {
      match: forbiddenLocation,
      additionalMessageInformation: countryName,
    };
  }

  matchBecauseOfNumberOfServerOpenPorts(data, conditions) {
    const ports = data.ports;
    const numberOpenPorts = ports.length;

    const maxSupportedNumberOpenPorts = conditions["server-open-ports-count"];

    return {
      match: numberOpenPorts >= maxSupportedNumberOpenPorts,
      additionalMessageInformation: numberOpenPorts,
    };
  }

  matchBecauseOfMatchingServerTag(data, conditions) {
    const tags = data.tags;
    const conditionTags = conditions["server-tags"];

    let match = null;
    conditionTags.forEach((conditionTag) => {
      if (match !== null) {
        return;
      }

      if (tags.includes(conditionTag)) {
        match = conditionTag;
      }
    });

    return {
      match: match !== null,
      additionalMessageInformation: match,
    };
  }

  matchBecauseOfScanResults(data, conditions) {
    let scans = data.scannedResults;

    if (scans === undefined || areValuesEqual(scans, {})) {
      return;
    }

    scans = scans.scans;

    if (scans === undefined) {
      return;
    }

    const scanConditions = conditions["site-scan-results"];

    let match = null;
    Object.entries(scans).forEach(([key, scan]) => {
      if (match !== null) {
        return;
      }

      let code = scan.result;
      code = code.split(" ")[0];

      if (scanConditions.includes(code)) {
        match = code;
      }
    });

    return {
      match: match !== null,
      additionalMessageInformation: match,
    };
  }
}
