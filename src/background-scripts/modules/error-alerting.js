"use strict";

function alertInvalidAPIKey(serviceName) {
    alert(`Dear user, your ${serviceName} API key is invalid.\n\nPlease change it in the extension's options page`)
}

function alertCouldNotEffectuateSiteCheck() {
    alert(`Dear use, the extension could not realize the site-check for a website.\n\nThis may be due to saturated limited API quotas for VIRUSTOTAL and SHODAN.`)
}

export {
    alertInvalidAPIKey,
    alertCouldNotEffectuateSiteCheck
};