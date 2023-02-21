// This file processes the analysed results and makes a detailed object to
// pass it to the blocking part of the program.

"use strict";

export default function processResults(domainName, match, toBlock) {
  if (match === null) {
    return null;
  }

  let returningObject = {};
  const conclusion = {};

  let message = getMessage(match);

  toBlock.forEach((blockingParameter) => {
    conclusion[blockingParameter] = true;

    if (blockingParameter === "closeSitePromptly") {
      message = getClosingPageMessage(message, domainName, match);
    }
  });

  returningObject = {
    match,
    conclusion,
    message,
    ...returningObject,
  };

  return returningObject;
}

function getClosingPageMessage(rawMessage, domainName, match) {
  let message = {};
  message.tldr = rawMessage.tldr;
  message.fullExplanation = `The site you tried to open (${domainName}) was closed because it was matched as ${match.match}.
The extension is activated for this site and the 'closeSitePromptly' blocking feature is enabled for this category. 
If you want to open the website, you can either disable the extension for the site or change the blocking features in the settings page.

${rawMessage.fullExplanation}`;

  return message;
}

function getMessage(match) {
  const additionalInformation = match.additionalMessageInformation;

  let messagesForDifferentMatches = {
    matchBecauseOfCveAge: {
      tldr: `The site has a poor security: hackers could attack it!`,
      fullExplanation: `The site is hosted on a server. This server has a CVE (vulnerability) that is ${additionalInformation} years old. This could mean that the site isn't taken care of.`,
    },
    matchBecauseOfMaxCvss: {
      tldr: `The site has a poor security: hackers could attack it!`,
      fullExplanation: `The site is hosted on a server. This server has a maximum CVSS score of ${additionalInformation}. This is a risky flaw (vulnerability) that hackers could attack.`,
    },
    matchBecauseOfNumberOfScans: {
      tldr: `Numerous antiviruses flagged the site as dangerous.`,
      fullExplanation: `The site has been flagged as either being a malware, a malicious, a suspicious or a phishing site by ${additionalInformation} antivirus${
        additionalInformation > 1 ? "es" : ""
      }.`,
    },
    matchBecauseOfLocationOfServer: {
      tldr: `The site is hosted in a blocked country. The site could be dangerous`,
      fullExplanation: `The site is hosted on a server. This server is located in ${additionalInformation} which is a blocked country.`,
    },
    matchBecauseOfNumberOfServerOpenPorts: {
      tldr: `The site could have been hacked.`,
      fullExplanation: `The site is hosted on a server that has ${additionalInformation} open ports. This server is doing a lot of different things at the same time: this means that hackers can easily compromise the site.`,
    },
    matchBecauseOfMatchingServerTag: {
      tldr: `The site could be dangerous.`,
      fullExplanation: `The site is hosted on a server. This server is flagged as "${additionalInformation}".`,
    },
    matchBecauseOfScanResults: {
      tldr: `An antivirus flagged the site as dangerous.`,
      fullExplanation: `The site has been flagged as ${additionalInformation}.`,
    },
  };

  return messagesForDifferentMatches[match.matchingMethodName];
}
