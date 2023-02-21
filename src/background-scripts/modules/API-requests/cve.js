// This file manages the cve API requests by creating the CveAPI class.
// - The getInfoAboutCVE fetches additional information about a CVE. (currently it is just looking for the cvss of the specified cve)

"use strict";

import modelRequest from "./modules/model-request.js";

export default class CveAPI {
  constructor() {}

  async getInfoAboutCVE(cve) {
    const requestURL = `https://cve.circl.lu/api/cve/${cve}`;

    const cveResults = await modelRequest(requestURL, {
      key: "id",
      defaultValue: cve,
    });

    const processedResults = this.processResults(cveResults);
    return processedResults;
  }

  async processResults(results) {
    // Here we want to retrieve:
    // --> the cvss of the cve

    const processedResults = {
      cve: results.id,
      cvss: results.cvss,
    };

    return processedResults;
  }
}
