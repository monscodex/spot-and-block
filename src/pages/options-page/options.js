// This makes the first instance of optionsManager and links the save and reset
// buttons to the optionsManager's methods.

"use strict";

import OptionsManager from "./components/optionsManager.js";
import optionsPlanning from "./options-planning/optionsPlanning.js";
import { chromeStorageSet } from "../../components/asynchronousChromeStorage.js";

let optionsManager = new OptionsManager(optionsPlanning);

document.addEventListener("DOMContentLoaded", () => {
  optionsManager.makeOptions();
});

document.getElementById("save-button").onclick = async () => {
  await optionsManager.saveOptions();
};

document.getElementById("reset-button").onclick = async () => {
  await chromeStorageSet({ options: {} });
  await optionsManager.setDefaultValuesIfNeeded();
  chrome.runtime.sendMessage({ message: "reloadTab" });
};
