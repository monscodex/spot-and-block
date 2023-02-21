// This file automatically cleans the oldest scan results. All the scanned results
// are saved on disk. If these are utilizing a large portion of the storage it
// will clean the old ones.

"use strict";

import { getBytesInUse } from "../../../components/asynchronousChromeStorage.js";

async function autoClean() {
  const maxBytes = 1000000;

  const oldestDomainNames = await getOldestSitesDomainNames(maxBytes);

  oldestDomainNames.forEach((domainName) => {
    delete window.sites[domainName];
  });
}

async function getOldestSitesDomainNames(maxBytes) {
  let domainNames = Object.keys(window.sites);

  let bytesInUse = await getBytesInUse("sites");
  const length = domainNames.length;
  const bytesPerItem = bytesInUse / length;

  // We don't want to delete the data of the current open sites
  domainNames = domainNames.filter(
    (domainName) => window.pageBlockers[domainName] === undefined
  );

  const getDatecheckedForDomain = (domainName) =>
    window.sites[domainName].dateChecked;

  domainNames.sort(
    (a, b) => getDatecheckedForDomain(b) - getDatecheckedForDomain(a)
  );

  let numberOfDomainNamesToRemove =
    (bytesInUse - 0.9 * maxBytes) / bytesPerItem;
  numberOfDomainNamesToRemove = Math.trunc(numberOfDomainNamesToRemove);

  domainNames = domainNames.slice(0, numberOfDomainNamesToRemove);

  return domainNames;
}

async function alwaysAutoclean() {
  setInterval(async () => {
    await autoClean();
  }, 10000);
}

alwaysAutoclean();
