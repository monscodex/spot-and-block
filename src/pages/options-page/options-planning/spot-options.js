"use strict";

import makeConditionOptions from "../components/makeConditionOptions.js";

const spotConditions = {
  "cvss-detector-value": {
    description: `<b>Minimum cvss (harmfulness):</b>

[A higher cvss (from 0 to 10) indicates a higher risk that the site has been hacked.]`,
    elementType: "input",
    inputType: "number",
    attributes: {
      min: 0,
      max: 10,
    },
  },
  "cve-year-detector-value": {
    description: `<b>The site has a vulnerability (cve) older than (in years):</b>

[An old vulnerability means that the site’s risk of getting hacked is higher than usual, either because the site hasn’t been updated for a while or because the people that designed the site don't care about its security.]`,
    elementType: "input",
    inputType: "number",
    attributes: {
      min: 0,
    },
  },
  "server-tags": {
    description: `<b>Tags attributed to the server that is hosting the website (one per line):</b>

Currently supported tags are:
<b>compromised</b>,
<b>malware</b>,
<b>doublepulsar</b>: Serious backdoor implant tool,
<b>honeypot</b>: A server that baits a trap for hackers,
<b>tor</b>: The server also runs a tor service,
<b>self-signed</b>: Site’s legitimacy hasn’t been checked by a third party [self-signed ssl certificate],
<b>vpn</b>: Server that is also used as a vpn

[Servers used for only one purpose are generally more secure.]`,
    elementType: "textArea",
  },
  "server-located-in-country": {
    description: `<b>The website is hosted in one of these countries or territories
    (Name of the country or territory <a href="../countries-page/countries.html" target="_blank" style="text-decoration: none" title="Supported Countries page">as written here</a>, one per line):</b>

    [Note: blocking the servers of a country is a personal decision. Take <a href="https://www.statista.com/statistics/266169/highest-malware-infection-rate-countries/" target="_blank" title="Countries with the highest malware rates of the first quarter of 2016.">this report</a> as an example and consider blocking countries that have the world’s highest malware rates.]

    Note that this criteria is not applicable if the BigDataCloud API is not available.`,
    elementType: "textArea",
  },
  "site-scan-results": {
    description: `<b> The site has been deemed as the one of the following adjectives by the scan (one per line):</b>

(Currently supported adjectives ares <b>phishing</b>, <b>malware</b>, <b>malicious</b> and <b>suspicious</b>)

    Note that this criteria is not applicable if the virusTotal API is not available.`,
    elementType: "textArea",
  },
  "number-of-suspicious-scans": {
    description: `<b>Minimum of antiviruses that detected something suspicious about this website:</b>

[To determine if a site contains malware, the service uses over 80 antiviruses. Usually a site that contains malware triggers about 8 of them, though 4 or 5 is enough to deem the site suspicious.]

Note that this criteria is not applicable if the virusTotal API is not available.`,
    elementType: "input",
    inputType: "number",
    attributes: {
      min: 0,
    },
  },
  "server-open-ports-count": {
    description: `<b>Minimum of server open ports:</b>

[The website is hosted by a server. The more open ports this server has, the more it's vulnerable to hacking]`,
    elementType: "input",
    inputType: "number",
    attributes: {
      min: 0,
    },
  },
};

let spotOptionsConditionalPlanning = {
  name: "needed-conditions-to-activate-mode",
  sectionName: "spot",
  description: "",
  elementType: "tabLayout",
  content: [
    {
      tabName: "critical",
      content: [
        {
          name: "cvss-detector-value",
          default: 8,
        },
        {
          name: "cve-year-detector-value",
          default: 8,
        },
        {
          name: "number-of-suspicious-scans",
          default: 4,
        },
        {
          name: "server-tags",
          default: ["malware", "compromised", "doublepulsar", "honeypot"],
        },
        {
          name: "server-located-in-country",
          default: [],
        },
        {
          name: "site-scan-results",
          default: ["malware", "phishing", "malicious"],
        },
        {
          name: "server-open-ports-count",
          default: 15,
        },
      ],
    },
    {
      tabName: "medium",

      content: [
        {
          name: "cvss-detector-value",
          default: 4,
        },
        {
          name: "cve-year-detector-value",
          default: 5,
        },
        {
          name: "number-of-suspicious-scans",
          default: 3,
        },
        {
          name: "server-tags",
          default: ["tor"],
        },
        {
          name: "server-located-in-country",
          default: [],
        },
        {
          name: "site-scan-results",
          default: [],
        },
        {
          name: "server-open-ports-count",
          default: 10,
        },
      ],
    },
    {
      tabName: "low-risk",
      content: [
        {
          name: "cvss-detector-value",
          default: 1,
        },
        {
          name: "cve-year-detector-value",
          default: 2,
        },
        {
          name: "number-of-suspicious-scans",
          default: 1,
        },
        {
          name: "server-tags",
          default: ["self-signed", "vpn"],
        },
        {
          name: "server-located-in-country",
          default: [],
        },
        {
          name: "site-scan-results",
          default: ["suspicious"],
        },
        {
          name: "server-open-ports-count",
          default: 5,
        },
      ],
    },
  ],
};

spotOptionsConditionalPlanning = makeConditionOptions(
  spotOptionsConditionalPlanning,
  spotConditions
);

export default spotOptionsConditionalPlanning;
