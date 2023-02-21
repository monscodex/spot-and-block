// This file defines the pageBlocker class. Each pageBlocker instance is defined by the ./block.js file.
// Each site has a specific pageBlocker instance that handles all the blocking made to that site.
// All of the separate blocking files like ./block-js-of-page.js or ./block-third-party-of-page.js rely on the each site's pageBlocker instance to determine if they are applying their blocking feature.

"use strict";

import { clearCookies, clearCache } from "./backgroundDataClearing.js";
import { blockingMethods } from "./blocking-methods.js";

export default class PageBlocker {
  constructor(domainName, tabId) {
    this.domainName = domainName;
    this.tabId = tabId;
    this.clearPeriod = 25;
    this.checkIfCanExecuteFunctionPeriod = 50;
    this.tabExists = true;

    this.possibleBlockingMethods = this.getPossibleBlockingMethods();
    this.codePerMethodToExecuteOnSite = this.getCodePerMethodToExecuteOnSite();

    this.alwaysCheckIfTabStillExists();
  }

  getPossibleBlockingMethods() {
    let processedBlockingMethods = blockingMethods.map(
      (blockingMethod) => blockingMethod.name
    );

    return processedBlockingMethods;
  }

  getCodePerMethodToExecuteOnSite() {
    // codePerMethod contains code to execute on the site.
    // It contains functions for blocking features that toggle between a
    // base case and the other case.
    let codePerMethod = {
      closeSitePromptly: "document.write('');",
      clearSessionStorage: "sessionStorage.clear();",
      clearLocalStorage: "localStorage.clear();",
      clearIndexedDB: `window.indexedDB.databases().then((databases) => { databases.forEach((database) => { window.indexedDB.deleteDatabase(database.name); }); });`,
    };

    codePerMethod[
      "blockOtherTypesOfStorageForSite"
    ] = `${codePerMethod.clearSessionStorage} ${codePerMethod.clearLocalStorage} ${codePerMethod.clearIndexedDB}`;

    codePerMethod["deleteCookiesOnLeave"] = (currentCase) => {
      if (currentCase === "base") {
        return `window.addEventListener("beforeunload", (e) => { if (window.amGoingToDeleteCookies) { chrome.runtime.sendMessage({ message: "clearCookies", domainName: window.location.hostname, }); } });`;
      } else {
        return `window.amGoingToDeleteCookies = ${currentCase}`;
      }
    };

    codePerMethod["deleteOtherTypesOfStorageOnLeave"] = (currentCase) => {
      if (currentCase === "base") {
        return `window.addEventListener("beforeunload", (e) => { if (window.amGoingToDeleteOtherTypesOfStorage) { chrome.runtime.sendMessage({ message: "clearCache" }); ${codePerMethod.clearSessionStorage} ${codePerMethod.clearLocalStorage} ${codePerMethod.clearIndexedDB}} });`;
      } else {
        return `window.amGoingToDeleteOtherTypesOfStorage = ${currentCase}`;
      }
    };

    return codePerMethod;
  }

  deduceWhatToBlock(analysedResults) {
    this.analysed = analysedResults;

    let conclusion = analysedResults === null ? {} : analysedResults.conclusion;
    if (conclusion.closeSitePromptly) {
      this.displayMessage = analysedResults.message;
    }

    // This is an array filled with the methods to call in order to block different things.
    this.currentBlockingMethods = Object.keys(conclusion);

    // Execute every possible blocking method: each one determines if they are
    // activated or not. They do that by checking if they are in the
    // currentBlockingMethods array.
    // NOTE: It is done this way because about half of the functions need
    // to accomplish different actions depending on whether they need to
    // block something or they need to unblock something.
    this.possibleBlockingMethods.forEach((blockingMethod) => {
      this[blockingMethod]();
    });

    this.reloadTabWithoutAnalysingItWhenReloaded();
  }

  alwaysCheckIfTabStillExists() {
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (!tabId === this.tabId) {
        return;
      }

      this.onClosedTab();
    });
  }

  onClosedTab() {
    this.tabExists = false;

    if (window.skipSiteCheckSites.includes(this.domainName)) {
      return;
    }

    delete window.pageBlockers[this.domainName];
  }

  executeInContentScript(code) {
    if (!this.tabExists) {
      return;
    }

    chrome.tabs.executeScript(
      this.tabId,
      { code },
      (_) => chrome.runtime.lastError
    );
  }

  closeSitePromptly() {
    const methodName = "closeSitePromptly";

    let closedSite = false;
    setInterval(() => {
      if (!this.currentBlockingMethods.includes(methodName) || closedSite) {
        return;
      }
      closedSite = true;

      // Delete all the html, css and js from the site
      this.executeInContentScript(
        this.codePerMethodToExecuteOnSite[methodName]
      );

      this.interceptTab();
    }, this.checkIfCanExecuteFunctionPeriod);
  }

  interceptTab() {
    if (!this.tabExists) {
      return;
    }

    // Create the tab
    chrome.tabs.create(
      { url: "../../../pages/intercepting-page/intercepting-page.html" },
      (pageTab) => {
        // The opened tab will automatically send a message
        chrome.runtime.onMessage.addListener(
          (request, sender, sendResponse) => {
            // Check that it's the right sender asking for the data
            if (
              request.message !== "giveMeTheInterceptingPageData" ||
              sender.tab.id !== pageTab.id
            ) {
              return;
            }

            sendResponse({
              message: "handingYouTheInterceptingPageData",
              displayMessage: this.displayMessage,
            });
          }
        );
      }
    );

    chrome.tabs.remove(this.tabId);

    const index = window.skipSiteCheckSites.indexOf(this.domainName);
    window.skipSiteCheckSites.splice(index, 1);

    this.onClosedTab();
  }

  blockJS() {
    // We just have to reload the tab since ./block-js-of-page.js is already
    // doing its job.
    const methodName = "blockJS";
    this.reloadTabInOrderToToggleProperty(methodName);
  }

  reloadTabInOrderToToggleProperty(methodName) {
    let toggle = false;
    let previousState = this.currentBlockingMethods.includes(methodName);
    let currentState = undefined;
    setInterval(() => {
      currentState = this.currentBlockingMethods.includes(methodName);

      toggle = previousState !== currentState;
      previousState = currentState;

      if (toggle && this.tabExists) {
        this.reloadTabWithoutAnalysingItWhenReloaded();
      }
    }, this.checkIfCanExecuteFunctionPeriod);
  }

  blockThirdPartyRequests() {
    // We just have to reload the tab as ./block-js-of-page.js is already
    // doing its job
    const methodName = "blockThirdPartyRequests";
    this.reloadTabInOrderToToggleProperty(methodName);
  }

  reloadTabWithoutAnalysingItWhenReloaded() {
    window.skipSiteCheckSites.push(this.domainName);
    chrome.tabs.reload(this.tabId, { bypassCache: false });
  }

  async blockOtherTypesOfStorageForSite() {
    const methodName = "blockOtherTypesOfStorageForSite";

    setInterval(() => {
      if (
        !this.tabExists ||
        !this.currentBlockingMethods.includes(methodName)
      ) {
        return;
      }

      clearCache();
      this.executeInContentScript(
        this.codePerMethodToExecuteOnSite[methodName]
      );
    }, this.clearPeriod);
  }

  async blockCookiesForSite() {
    const methodName = "blockCookiesForSite";

    setInterval(() => {
      if (
        !this.tabExists ||
        !this.currentBlockingMethods.includes(methodName)
      ) {
        return;
      }

      clearCookies(this.domainName);
    }, this.clearPeriod);
  }

  deleteOtherTypesOfStorageOnLeave() {
    const methodName = "deleteOtherTypesOfStorageOnLeave";

    this.manageDeleteOnLeave(methodName);
  }

  deleteCookiesOnLeave() {
    const methodName = "deleteCookiesOnLeave";

    this.manageDeleteOnLeave(methodName);
  }

  manageDeleteOnLeave(methodName) {
    let toggle = false;
    let previousState = this.currentBlockingMethods.includes(methodName);
    let currentState = undefined;

    this.executeInContentScript(
      this.codePerMethodToExecuteOnSite[methodName]("base")
    );

    setInterval(() => {
      currentState = this.currentBlockingMethods.includes(methodName);

      toggle = previousState !== currentState;
      previousState = currentState;

      if (!(toggle && this.tabExists)) {
        return;
      }

      // Execute code when leaving the page.
      this.executeInContentScript(
        this.codePerMethodToExecuteOnSite[methodName](currentState)
      );
    }, this.checkIfCanExecuteFunctionPeriod);
  }

  clearSessionStorage() {
    this.executeInContentScript(
      this.codePerMethodToExecuteOnSite["clearSessionStorage"]
    );
  }

  clearLocalStorage() {
    this.executeInContentScript(
      this.codePerMethodToExecuteOnSite["clearLocalStorage"]
    );
  }

  clearIndexedDB() {
    this.executeInContentScript(
      this.codePerMethodToExecuteOnSite["clearIndexedDB"]
    );
  }

  toggleMethod(methodName) {
    const index = this.currentBlockingMethods.indexOf(methodName);

    const active = index === -1 ? false : true;

    if (active) {
      this.currentBlockingMethods.splice(index, 1);
    } else {
      this.currentBlockingMethods.push(methodName);
    }
  }
}
