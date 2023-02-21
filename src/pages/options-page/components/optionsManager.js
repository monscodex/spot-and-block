// This file contains the OptionsManager class. It is one of the gears of
// making an automatic option page.
// The included options (defined in optionsPlanning.js) are provided to this class.
//
// This class was made in order to have a centralized way to manage all of the
// individual options. This helps display all of the options and save the
// options' values to storage.

"use strict";

import textArea from "./textArea.js";
import inputTag from "./inputTag.js";
import tabLayout from "./tabLayout.js";
import {
  chromeStorageGet,
  chromeStorageSet,
} from "../../../components/asynchronousChromeStorage.js";
import sectionManager from "./section-manager.js";

export default class OptionsManager {
  constructor(optionsPlanning, embedded = false) {
    this.optionsPlanning = this.sanitizeOptionsPlanning(optionsPlanning);
    this.embedded = embedded;

    // Here are going to be stored the instances of the options
    this.optionsInstances = {};
  }

  sanitizeOptionsPlanning(optionsPlanning) {
    let processedOptionsPlanning = optionsPlanning.map((optionPlanning) => {
      if (optionPlanning.elementType === "tabLayout") {
        optionPlanning = this.sanitizeTabLayout(optionPlanning);
      }

      return optionPlanning;
    });

    return processedOptionsPlanning;
  }

  sanitizeTabLayout(tabLayout) {
    // Attribute to the options contained in the tab (children of the tab) a special section name
    // (that has to do with the tab (parent) name).

    const tabParentOptionName = tabLayout.name;

    tabLayout.content = tabLayout.content.map((tab) => {
      const tabName = tab.tabName;
      tab.content = tab.content.map((option) => {
        option.sectionName = `${tabParentOptionName}-${tabName}-tab-content`;
        return option;
      });

      return tab;
    });

    return tabLayout;
  }

  async setDefaultValuesIfNeeded() {
    if (this.embedded) {
      return;
    }

    let options = await chromeStorageGet("options");

    options = options === undefined ? {} : options;

    this.optionsPlanning.forEach((optionPlanning) => {
      // The tab layout is a special layout that contains sub objects
      // So we want to make it return its default values
      /* {
        tabLayoutOptionName: {
          tab1Name: {
            option1Name: 1324
          }
          tab2Name: {
            option2Name: true
          }
        }
      }
      */
      const optionDefaultValue =
        optionPlanning.elementType === "tabLayout"
          ? this.getDefaultValueOfTabLayout(optionPlanning)
          : optionPlanning.default;

      // If the option didn't exist we will register the key and the default value
      const optionName = optionPlanning.name;
      if (!options[optionName]) {
        options[optionName] = optionDefaultValue;
      }
    });

    // Save the modified version of the options
    await chromeStorageSet({ options });
  }

  getDefaultValueOfTabLayout(tabLayoutOptionPlanning) {
    let defaultValue = {};

    tabLayoutOptionPlanning.content.forEach((tab) => {
      const tabName = tab.tabName;
      defaultValue[tabName] = {};

      tab.content.forEach((option) => {
        defaultValue[tabName][option.name] = option.default;
      });
    });

    return defaultValue;
  }

  makeOptions() {
    // The key to this object will be the html id of the container
    // and the value will be the optionContainerManager instance.
    let optionsTableContainers = {};

    this.optionsPlanning.forEach((optionPlanning) => {
      const optionType = optionPlanning.elementType;

      let optionInstance;
      switch (optionType) {
        case "input":
          optionInstance = new inputTag(
            optionPlanning.inputType,
            optionPlanning.attributes ? optionPlanning.attributes : {}
          );
          break;

        case "textArea":
          optionInstance = new textArea(optionPlanning.description);
          break;

        case "tabLayout":
          optionInstance = new tabLayout(
            optionPlanning.name,
            optionPlanning.sectionName,
            optionPlanning.content
          );
          break;
      }

      this.optionsInstances[optionPlanning.name] = optionInstance;

      if (optionType === "tabLayout") {
        return;
      }

      let currentOptionContainer =
        optionsTableContainers[optionPlanning.sectionName];

      if (currentOptionContainer === undefined) {
        const sectionName = optionPlanning.sectionName;
        currentOptionContainer = new sectionManager(sectionName);

        optionsTableContainers[optionPlanning.sectionName] =
          currentOptionContainer;
      }

      const option = optionInstance.createOption();
      currentOptionContainer.addOption(option, optionPlanning.description);
    });

    setTimeout(() => {
      this.showStoredValueOfOptions();
    }, 50);
  }

  async saveOptions() {
    // We want every option instance to give us its visual value
    let options = {};

    let optionNames = Object.entries(this.optionsInstances).map(
      ([optionName, optionInstance]) => optionName
    );

    let optionVisualValues = Object.entries(this.optionsInstances).map(
      async ([optionName, optionInstance]) =>
        await optionInstance.returnCurrentVisualValue()
    );

    optionVisualValues = await Promise.all(optionVisualValues);

    for (let i = 0; i < optionNames.length; i++) {
      const optionName = optionNames[i];
      const optionVisualValue = optionVisualValues[i];

      options[optionName] = optionVisualValue;
    }

    if (this.embedded) {
      return options;
    }

    await chromeStorageSet({ options });
  }

  async showStoredValueOfOptions() {
    if (this.embedded) {
      return;
    }

    const options = await chromeStorageGet("options");
    this.makeOptionsShowValues(options);
  }

  makeOptionsShowValues(optionValues) {
    Object.entries(optionValues).forEach(([optionName, optionValue]) => {
      this.optionsInstances[optionName].showValue(optionValue);
    });
  }
}
