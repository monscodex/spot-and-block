// This file manages the virustotal API requests by creating the VirusTotalAPI class.
// - The completeCheckUrl method gets the antivirus report about the website's domain name.
//   It verifies if the current antivirus report is deprecated. If it is, it will ask to actualize the report and fetch the updated results.

'use strict'

import modelRequest from './modules/model-request.js'
import { alertInvalidAPIKey } from '../error-alerting.js'
import { UpdatedVariable } from '../updateVariableToSavedVariable.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default class VirusTotalAPI {
  constructor() {
    new UpdatedVariable(this, 'key', 'options.virus-total-api-key')

    // Defined in Milliseconds
    new UpdatedVariable(this, 'scanTimeout', 'options.virus-total-scan-timeout')

    this.limitRequestsPerMinute = 4
    this.numberOfRequestsMadeInTheLastMinute = 0
    this.madeRequestsInTheLastMinute = []
  }

  async completeCheckUrl(url) {
    const urlReportResults = await this.urlReport(url)
    if (urlReportResults === undefined) {
      return
    }

    const resultsScanDate = urlReportResults.scanDate
    const resultsExpired = this.areResultsExpired(resultsScanDate)

    if (!resultsExpired) {
      return urlReportResults
    }

    const scannedResults = await this.urlScan(url)

    if (scannedResults === undefined) {
      return urlReportResults
    }

    return scannedResults
  }

  async urlReport(url) {
    if (!this.canMakeRequest()) {
      return
    }

    const requestUrl = `https://www.virustotal.com/vtapi/v2/url/report?apikey=${this.key}&resource=${url}`

    try {
      const results = await modelRequest(requestUrl, {
        key: 'resource',
        defaultValue: url,
      })

      const processedResults = this.processResultsUrlReport(results)
      return processedResults
    } catch (error) {
      if (error.response.status === 403) {
        alertInvalidAPIKey('VIRUSTOTAL')
      } else {
        throw(error)
      }
    }
  }

  async urlScan(url) {
    if (!this.canMakeRequest()) {
      return
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `apikey=${this.key}&url=${url}`,
    }

    try {
      const results = await modelRequest(
        'https://www.virustotal.com/vtapi/v2/url/scan',
        {
          areResultsValid: (rawResults, url) => {
            const resultsDomainName = new URL(rawResults.url).domainName

            if (resultsDomainName !== url) {
              return false
            }

            return true
          },
          arguments: url,
        },
        options
      )

      const updatedUrlReport = await this.getUpdatedUrlReportFrom(
        results.scan_id
      )

      return updatedUrlReport
    } catch (error) {
      if (!this.canMakeRequest()) {
        return;
      }

      if (error.response.status === 403) {
        alertInvalidAPIKey('VIRUSTOTAL')
      } else {
        throw(error)
      }
    }
  }

  async getUpdatedUrlReportFrom(scanID) {
    // Scan the resource, wait a few seconds (this is necessary: if there
    // is no waiting time the urlReport will be the one that isn't updated)
    let resultsExpired = true
    let urlReportResults

    await delay(3000)
    do {
      await delay(1000)
      urlReportResults = await this.urlReport(scanID)

      if (urlReportResults === undefined) {
        return;
      }

      resultsExpired = this.areResultsExpired(urlReportResults.scanDate)
    } while (resultsExpired)

    return urlReportResults
  }

  areResultsExpired(resultsScanDate) {
    // This function verifies if the report is recent enough (compared to
    // this.scanTimeout). If it isn't, it will scan the website and it will get
    // the updated results

    // Get the current date in milliseconds
    let currentDate = new Date()
    currentDate = currentDate.getTime()

    // Get the scan's date in a Date object
    let resultsDate
    try {
      resultsDate = resultsScanDate.replace(' ', 'T')
    } catch (e) {
      // The site has never been analyzed
      return true
    }
    resultsDate = `${resultsDate}Z`
    resultsDate = new Date(resultsDate)

    // Get the expireDate in milliseconds
    const scanTimeoutInMilliseconds = this.scanTimeout * 24 * 60 * 60 * 1000

    let expireDate = new Date(resultsDate.getTime() + scanTimeoutInMilliseconds)
    expireDate = expireDate.getTime()

    const resultsExpired = currentDate > expireDate

    return resultsExpired
  }

  processResultsUrlReport(results) {
    // Here we want to retrieve:
    // --> the multiple antiviruses analyses of the page (only the ones whose description
    // isn't "clean site" or "unrated site")

    let processedResults = {
      positives: results.positives,
      total: results.total,
      scanDate: results.scan_date,
    }
    processedResults.scans = {}

    if (results.scans === undefined) {
      return processedResults
    }

    // Add the malware analysis of the current AV to the processedResults.scans
    // if its description isn't "clean site", or "unrated site"
    for (const [key, value] of Object.entries(results.scans)) {
      const warningComment =
        value.result !== 'clean site' && value.result !== 'unrated site'

      if (value.detected || warningComment) {
        processedResults.scans[key] = value
      }
    }

    return processedResults
  }

  canMakeRequest() {
    this.recalculateMadeRequests()

    if (this.blocked) {
      return false
    }

    // We want to make sure that we won't allow the exceeding requests
    if (
      this.numberOfRequestsMadeInTheLastMinute >= this.limitRequestsPerMinute
    ) {
      this.blockRequests()
      return false
    }

    // This adds a made request to the array of made requests
    this.addMadeRequest()

    return true
  }

  addMadeRequest() {
    this.madeRequestsInTheLastMinute.push(new Date().getTime())
  }

  recalculateMadeRequests() {
    const currentDate = new Date().getTime()

    const requestWasMadeInTheLastMinute = (requestDate) =>
      requestDate >= currentDate - 1000 * 60

    this.madeRequestsInTheLastMinute = this.madeRequestsInTheLastMinute.filter(
      requestWasMadeInTheLastMinute
    )

    this.numberOfRequestsMadeInTheLastMinute =
      this.madeRequestsInTheLastMinute.length
  }

  blockRequests() {
    const timeToBlock = this.getTimeToBlock()

    this.blocked = true

    setTimeout(() => {
      this.blocked = false
      this.numberOfRequestsMadeInTheLastMinute -= this.limitRequestsPerMinute
    }, timeToBlock)
  }

  getTimeToBlock() {
    const currentDate = new Date().getTime()
    const firstRequestMadeThisTimeAgo =
      currentDate - this.madeRequestsInTheLastMinute[0]

    return 62 * 1000 - firstRequestMadeThisTimeAgo
  }
}
