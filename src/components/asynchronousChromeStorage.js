// This file contains functions that interact with the chrome storage (by setting or retrieving information) in a modern way (using javascript's promises).
// These functions exist because Chrome provides the storage functions without using promises.

// Who doesn't want an asynchronous way to access the chrome local storage
// api?
"use strict";

import areValuesEqual from "./compareValues.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function chromeStorageGet(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (rawData) => {
      if (rawData === {}) {
        // The key wasn't saved
        return undefined;
      } else if (rawData === undefined) {
        // The request was wrong
        console.trace("IMPORTANT PROBLEM. CANNOT ACCESS CHROME STORAGE");

        resolve(undefined);
      }

      const data = rawData[key];
      resolve(data);
    });
  });
}

async function chromeStorageSet(saveToStorage) {
  chrome.storage.local.set(saveToStorage);

  await verifyVariableSavedCorrectly(saveToStorage);
}

async function verifyVariableSavedCorrectly(savedToStorage) {
  return new Promise(async (resolve) => {
    let [key, value] = Object.entries(savedToStorage)[0];

    let savedValue;
    do {
      await delay(5);

      savedValue = await chromeStorageGet(key);
    } while (!areValuesEqual(value, savedValue));

    resolve();
  });
}

async function getBytesInUse(key) {
  return new Promise(async (resolve) => {
    chrome.storage.local.getBytesInUse(key, (bytesInUse) => {
      resolve(bytesInUse);
    });
  });
}

export { chromeStorageGet, chromeStorageSet, getBytesInUse };
