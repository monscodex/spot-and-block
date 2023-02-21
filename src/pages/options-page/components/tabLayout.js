// This file contains the code needed to manage an option of type 'tabLayout'.
// Each tab is a different category that has the same options with different
// values. The tabLayout is used for both the spot and the block options.

"use strict";

import OptionsManager from "./optionsManager.js";

export default class tabLayout {
  constructor(optionName, sectionName, content) {
    this.optionName = optionName;
    this.sectionName = sectionName;
    this.content = content;
    this.tabs = {};

    this.loadOption();
  }

  loadOption() {
    this.createOptionContainerAttribute();

    this.createTabsRowAttribute();

    this.optionContainer.appendChild(this.tabsRow);

    this.fillTabColumnWithTabs();

    // Add the option's container to the corresponding section
    const section = document.getElementById(`${this.sectionName}-section`);
    section.appendChild(this.optionContainer);
  }

  createOptionContainerAttribute() {
    const optionDIV = document.createElement("div");

    optionDIV.classList.add("option");
    optionDIV.classList.add("tab-content-and-container");

    this.optionContainer = optionDIV;
  }

  createTabsRowAttribute() {
    const tabsRow = document.createElement("div");
    tabsRow.classList.add("tabs-row");
    this.tabsRow = tabsRow;
  }

  fillTabColumnWithTabs() {
    this.content.forEach((tabPlanning) => {
      const tab = new Tab(
        tabPlanning,
        this.tabsRow,
        this.optionContainer,
        this.optionName
      );
      tab.createTab(this.tabsRow);

      this.tabs[tabPlanning.tabName] = tab;
    });
  }

  showValue(values) {
    Object.entries(values).forEach(([tabName, tabOptionsValues]) => {
      this.tabs[tabName].showValues(tabOptionsValues);
    });
  }

  async returnCurrentVisualValue() {
    let visualValues = {};

    let tabs = Object.entries(this.tabs);
    let tabNames = tabs.map(([tabName, tab]) => tabName);

    let results = tabs.map(async ([tabName, tab]) =>
      tab.returnOptionsCurrentVisualValues()
    );

    results = await Promise.all(results);

    for (let i = 0; i < tabNames.length; i++) {
      let tabName = tabNames[i];
      let result = results[i];

      visualValues[tabName] = result;
    }

    return visualValues;
  }
}

class Tab {
  constructor(tabPlanning, tabsRow, optionDIV, parentOptionName) {
    this.tabPlanning = tabPlanning;
    this.tabsRow = tabsRow;
    this.optionDIV = optionDIV;
    this.parentOptionName = parentOptionName;

    // the True at the end means that it is an embedded optionsManager (it
    // will not write the values directly to storage when it wants to
    // save the values, this optionsManager will return an object of
    // the values and the main optionsManager will write them to
    // storage)
    this.optionsManager = new OptionsManager(tabPlanning.content, true);
  }

  createTab() {
    const tabName = this.tabPlanning.tabName;

    this.createDisplayButtonAttribute(tabName);

    this.createContentsOfTabAttribute(tabName);

    this.tabsRow.appendChild(this.displayButton);
    this.optionDIV.appendChild(this.contentsOfTab);

    setTimeout(() => {
      this.optionsManager.makeOptions();
    }, 50);
  }

  createDisplayButtonAttribute(tabName) {
    const tabDisplayButton = document.createElement("button");
    tabDisplayButton.classList.add("display-tab-button");
    tabDisplayButton.textContent = tabName;

    tabDisplayButton.onclick = () => {
      this.displayContentsOfTab();
    };

    this.displayButton = tabDisplayButton;
  }

  createContentsOfTabAttribute(tabName) {
    const contentsOfTab = document.createElement("div");
    contentsOfTab.id = `${this.parentOptionName}-${tabName}-tab-content-section`;

    contentsOfTab.classList.add("tab-content");

    this.contentsOfTab = contentsOfTab;
  }

  displayContentsOfTab() {
    const contents = [...this.optionDIV.getElementsByClassName("tab-content")];
    const displayTabButtons = [
      ...this.tabsRow.getElementsByClassName("display-tab-button"),
    ];

    contents.forEach((tabContent) => {
      tabContent.style.display = "none";
    });

    displayTabButtons.forEach((displayTabButton) => {
      try {
        displayTabButton.classList.remove("active");
      } catch {
        // The element didn't have the active class
      }
    });

    this.contentsOfTab.style.display = "block";
    this.displayButton.classList.add("active");
  }

  async returnOptionsCurrentVisualValues() {
    // Because this is an EMBEDDED optionsManager the saveOptions method will
    // return the visual values as an object instead of writing them into the
    // chrome storage (see optionsManager.js)
    const optionsCurrentVisualValues = await this.optionsManager.saveOptions();

    return optionsCurrentVisualValues;
  }

  showValues(optionsValues) {
    this.optionsManager.makeOptionsShowValues(optionsValues);
  }
}
