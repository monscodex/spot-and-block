// This file makes sure that all the options are loaded before starting to
// do anything because almost all of the code depends on the options.

"use strict";

import { chromeStorageGet } from "../../components/asynchronousChromeStorage.js";

export default async function waitUntilOptionsLoaded() {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (await optionsNotLoaded()) {
    await delay(10);
  }
}

async function optionsNotLoaded() {
  const optionsLoaded = await chromeStorageGet("optionsLoaded");

  return !optionsLoaded || optionsLoaded === undefined;
}
