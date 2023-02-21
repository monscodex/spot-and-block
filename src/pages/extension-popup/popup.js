// This file has tree main purposes:
//  - Displaying the deactivation button defined in disabling-extension.js
//  - Getting the category to which the site was matched
//  - Displaying the blocking buttons defined in interactive-blocking.js

"use strict";

import InteractiveBlocker from "./interactive-blocking-with-buttons/interactive-blocking.js";
import DisablingExtension from "./disabling-extension-for-site-button/disabling-extension.js";

document.addEventListener("DOMContentLoaded", () => {
    new PopupManager();
});

class PopupManager {
    constructor() {
        this.getHTMLElements();
        this.displayStillAnalysing();
        this.gotPageBlockerData = false;

        this.getBlockingFeatures();
        this.enableOpenOptionPageOnButtonClick();
    }

    findDomainName() {
        return new Promise((resolve) => {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                this.tabId = tabs[0].id;
                const url = tabs[0].url;

                if (!siteIsAnalysable(url)) {
                    resolve(null);
                }

                let domainName;
                try {
                    domainName = new URL(url).hostname;
                } catch (e) {
                    resolve(null);
                }

                resolve(domainName);
            });
        });
    }

    getHTMLElements() {
        this.categoryElement = document.getElementById("site-match-category");
        this.buttonsDiv = document.getElementById("blocking-buttons-div");
        this.openOptionsPageButton = document.getElementById("option-page-open-button");
    }

    async getBlockingFeatures() {
        this.domainName = await this.findDomainName();

        // If the site isn't a website (isn't using http or https)
        if (this.domainName === null) {
            this.displayTheSiteIsNotAnalysable();
            return;
        }

        this.addDeactivatingFeature();

        chrome.runtime.sendMessage({
            message: "getPageBlockerData",
            domainName: this.domainName,
            tabId: this.tabId,
        });

        chrome.runtime.onMessage.addListener((request) => {
            if (
                !(
                    request.message === "hereIsThePageBlockerData" &&
                    request.tabId === this.tabId &&
                    !this.gotPageBlockerData
                )
            ) {
                return;
            }

            this.gotPageBlockerData = true;

            this.pageBlockerData = request.pageBlockerData;

            // Going to pass it as an argument as it is making an "Reading
            // undefined property" error...
            this.displayCategory(this.pageBlockerData.analysed);
            this.makeBlockingInteractive();
        });
    }

    displayTheSiteIsNotAnalysable() {
        document.body.innerHTML = `
        <h1 id="popup-error-message">
            This site isn't parsable...
        </h1>
        ${this.openOptionsPageButton.outerHTML}
        `;

        document.body.style.width = "400px";
    }

    displayCategory(analysed) {
        const match = analysed === null ? null : analysed.match.match;

        let dataToShow = {};

        if (match === null) {
            dataToShow.category = "The Site Is Safe!";
            dataToShow.explanation =
                "This site wasn't been matched to any of the three risk categories.";
        } else {
            dataToShow.category = match;
            dataToShow.explanation = analysed.message.fullExplanation;

            if (!match.includes("-risk")) {
                dataToShow.category += "-risk";
            }
        }

        this.categoryElement.innerText = dataToShow.category;
        this.categoryElement.title = dataToShow.explanation;
    }

    makeBlockingInteractive() {
        new InteractiveBlocker(
            this.pageBlockerData.possibleBlockingMethods,
            this.pageBlockerData.currentBlockingMethods,
            this.buttonsDiv,
            this.domainName
        );
    }

    displayStillAnalysing() {
        this.categoryElement.innerText = "The site is being parsed...";
    }

    addDeactivatingFeature() {
        new DisablingExtension(this.domainName, this.tabId);
    }

    enableOpenOptionPageOnButtonClick() {
        this.openOptionsPageButton.onclick = () => {chrome.runtime.openOptionsPage();}
    }
}

function siteIsAnalysable(url) {
    return url.match("^http(s)?://.*/");
}

