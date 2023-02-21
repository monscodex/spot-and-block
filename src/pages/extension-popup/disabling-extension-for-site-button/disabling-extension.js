// This file is going to manage the popup's activation and deactivation feature.
// It asks popup-disabling-extension-for-site.js to toggle if the extension is
// deactivated for the site.

"use strict";

export default class DisablingExtension {
    constructor(domainName, tabId) {
        this.domainName = domainName;
        this.tabId = tabId;

        this.button = this.getButton();
        this.isExtensionActivatedForSite();
    }

    isExtensionActivatedForSite() {
        chrome.runtime.sendMessage({
            message: "getExtensionActivationForSite",
            domainName: this.domainName,
            tabId: this.tabId,
        });

        chrome.runtime.onMessage.addListener((request) => {
            if (
                !(
                    request.message === "hereIsTheExtensionActivationForSite" &&
                    request.tabId === this.tabId
                )
            ) {
                return;
            }

            this.extensionActivatedForSite = !request.extensionDisabledForSite;

            this.updateState();
        });
    }

    updateButtonDisplay() {
        let classToAdd;
        let classToRemove;
        let newButtonName;
        if (this.extensionActivatedForSite) {
            classToRemove = "deactivated-button";
            classToAdd = "activated-button";

            newButtonName = "Activated";
        } else {
            classToRemove = "activated-button";
            classToAdd = "deactivated-button";

            newButtonName = "Deactivated";
        }

        this.button.classList.remove(classToRemove);
        this.button.classList.add(classToAdd);

        this.button.innerText = newButtonName;
    }

    updatePopupDisplay() {
        const allSectionsDisplay = this.extensionActivatedForSite
            ? "block"
            : "none";

        const sections = [...document.getElementsByTagName("section")];

        sections.forEach((section) => {
            section.style.display = allSectionsDisplay;
        });

        if (!this.extensionActivatedForSite) {
            document.getElementById(
                "activation-deactivation-div"
            ).style.display = "block";
        }
    }

    updateState() {
        this.updateButtonDisplay();
        this.updatePopupDisplay();
    }

    getButton() {
        const button = document.getElementById(
            "activation-deactivation-button"
        );

        button.onclick = () => {
            this.toggleFunctionalityOfButton();
        };

        return button;
    }

    toggleFunctionalityOfButton() {
        this.extensionActivatedForSite = !this.extensionActivatedForSite;

        chrome.runtime.sendMessage({
            message: "toggleExtensionActivationForSite",
            domainName: this.domainName,
            tabId: this.tabId,
        });

        this.updateState();
    }
}
