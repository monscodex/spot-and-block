// This file is going to make sure the default values of the options are
// applied when the extension is first installed.

"use strict";

chrome.storage.local.set({ optionsLoaded: false });

import OptionsManager from "../pages/options-page/components/optionsManager.js";
import optionsPlanning from "../pages/options-page/options-planning/optionsPlanning.js";
import {
  chromeStorageGet,
  chromeStorageSet,
} from "../components/asynchronousChromeStorage.js";

let keysToCheck = [
  { key: "sites", defaultValue: {} },
  { key: "DNtoIP", defaultValue: {} },
];

chrome.runtime.onInstalled.addListener(async () => {
  const optionsManager = new OptionsManager(optionsPlanning);

  let promises = keysToCheck.map(({ key, defaultValue }) =>
    setDefaultValueIfNeeded(key, defaultValue)
  );

  promises.push(optionsManager.setDefaultValuesIfNeeded());
  keysToCheck = await Promise.all(promises);

  chrome.storage.local.set({ optionsLoaded: true });

  reloadAllTabs();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ optionsLoaded: true });
});

async function setDefaultValueIfNeeded(key, value) {
  const savedVariable = await chromeStorageGet(key);

  if (savedVariable !== undefined) {
    return;
  }

  let saveToStorage = {};
  saveToStorage[key] = value;

  await chromeStorageSet(saveToStorage);
}

function reloadAllTabs() {
  setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(reloadTab);
    });
  }, 50);
}

function reloadTab(tab) {
  chrome.tabs.reload(tab.id);
}
