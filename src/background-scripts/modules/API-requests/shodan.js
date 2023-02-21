// This file manages the shodan API requests by creating the ShodanAPI class.
// - The parseIP method gets information about an ip (the server's IP).
//   It will get:
//      - the ip's CVEs (with some additional information using ./cve.js).
//      - the ip's open ports.
//      - the ip's sever tags.
//      - the ip's location (with the countryName using ./reverseGeolocation).

'use strict'

import modelRequest from './modules/model-request.js'
import CveAPI from './cve.js'
import GeolocationAPI from './reverseGeolocation.js'
import { UpdatedVariable } from '../updateVariableToSavedVariable.js'
import { alertInvalidAPIKey } from '../error-alerting.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default class ShodanAPI {
  constructor() {
    new UpdatedVariable(
            this,
            'key',
            'options.shodan-api-key'
    );

    this.cveAPI = new CveAPI()
    this.geolocationAPI = new GeolocationAPI()

    this.limitRequestsPerSecond = 3
    this.madeRequestsStack = []
    this.madeRequestsPerSecond = 0
    this.blocked = false
    this.alwaysBlockRequestsIfNeeded()
  }

  async parseIP(ip) {
    const requestURL = `https://api.shodan.io/shodan/host/${ip}?key=${this.key}&minify=true`

    await this.waitUntilRequestCanBeMade()

    try {
      const results = await modelRequest(
        requestURL,
        {
          key: 'ip_str',
          defaultValue: ip,
        },
        {},
        1
      )

      const processedResults = await this.processResults(results)
      return processedResults
    } catch (error) {
      switch (error.response.status) {
        // Invalid API key
        case 401:
          alertInvalidAPIKey('SHODAN')
          break

        // 429 Too many requests
        case 429:
          await delay(1000 + Math.random() * 2000)
          this.waitUntilRequestCanBeMade()
          return this.parseIP(ip)

        default:
          throw(error)
      }
    }
  }

  async processResults(results) {
    /* Here we want to retrieve:
           -> the Location of the server
           -> the possible CVEs
           -> the open ports
           -> the tags
        */

    const location = await this.getLocation(results)

    let processedResults = {
      location,
      tags: results.tags,
      ports: results.ports,
    }

    // Adding more complete CVEs
    let CVEs = results.vulns
    if (CVEs === undefined) {
      return processedResults
    }

    processedResults.CVEs = await this.processCVEs(CVEs)

    return processedResults
  }

  async processCVEs(rawCVEs) {
    let CVEs = rawCVEs.map(
      async (cve) => await this.cveAPI.getInfoAboutCVE(cve)
    )
    let result = await Promise.all(CVEs)

    return result
  }

  async getLocation(results) {
    const latitude = results.latitude
    const longitude = results.longitude

    // Adding the countryname to the results
    const location = {
      city: results.city,
      country: undefined,
      codes: {
        region: results.region_code,
        area: results.area_code,
        country: results.country_code,
      },
      latitude,
      longitude,
    }

    const countryName = await this.geolocationAPI.reverseCountrySearch(
      latitude,
      longitude
    )

    location.country = countryName

    return location
  }

  async waitUntilRequestCanBeMade() {
    const currentTime = new Date().getTime()
    this.madeRequestsStack.push(currentTime)

    while (this.blocked || this.madeRequestsStack.indexOf(currentTime) !== 0) {
      await delay(100)
    }

    this.madeRequestsPerSecond++
    this.madeRequestsStack.shift()
  }

  blockRequestsIfNeeded() {
    if (
      this.madeRequestsPerSecond < this.limitRequestsPerSecond ||
      this.blocked
    ) {
      return
    }

    this.blocked = true
    setTimeout(() => {
      this.madeRequestsPerSecond -= this.limitRequestsPerSecond
      this.blocked = false
    }, 1000)
  }

  alwaysBlockRequestsIfNeeded() {
    setInterval(() => {
      this.blockRequestsIfNeeded()
    }, 10)
  }
}
