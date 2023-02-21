// This file manages the GeolocationAPI class
// - The reverseCountrySearch is going to find the country name of a certain location given the longitude and latitude.

"use strict";

import modelRequest from "./modules/model-request.js";

export default class GeolocationAPI {
  constructor() {}

  async reverseCountrySearch(latitude, longitude) {
    const reverseSearchUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

    const rawResults = await modelRequest(reverseSearchUrl, {});
    if (rawResults === undefined) {
      return;
    }

    const countryName = this.processResults(rawResults);

    return countryName;
  }

  processResults(rawResults) {
    return rawResults.countryName;
  }
}
