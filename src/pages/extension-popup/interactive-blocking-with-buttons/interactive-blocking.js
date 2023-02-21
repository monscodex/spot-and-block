// This file is going to manage the popup's interactive feature blocking. It
// asks block.js to toggle each functionality when the buttons are clicked.

"use strict";

export default class InteractiveBlocker {
    constructor(
        possibleBlockingMethods,
        currentBlockingMethods,
        buttonsDiv,
        domainName
    ) {
        this.possibleBlockingMethods = possibleBlockingMethods;
        this.currentBlockingMethods = currentBlockingMethods;
        this.buttonsDiv = buttonsDiv;
        this.domainName = domainName;

        this.buttons = this.createButtons();
    }

    createButtons() {
        let buttons = this.possibleBlockingMethods.map((blockingMethod) =>
            this.createButton(blockingMethod)
        );

        buttons.forEach((button) => {
            this.buttonsDiv.appendChild(button);
        });
    }

    createButton(blockingMethod) {
        const methodName = blockingMethod.name;
        const methodDescription = blockingMethod.description;

        const button = document.createElement("button");
        button.type = "button";
        button.innerText = methodName;
        button.id = convertCamelCaseToDashCase(methodName);
        button.title = methodDescription;

        button.onclick = () => {
            this.toggleFunctionalityOfButton(methodName, button);
        };

        this.updateButtonDisplay(methodName, button);
        return button;
    }

    toggleFunctionalityOfButton(methodName, button) {
        this.updateCurrentBlockingMethods(methodName);

        chrome.runtime.sendMessage({
            message: "pageBlockerToggleMethod",
            domainName: this.domainName,
            methodName,
        });

        this.updateButtonDisplay(methodName, button);
    }

    updateCurrentBlockingMethods(methodName) {
        const index = this.currentBlockingMethods.indexOf(methodName);
        const active = index === -1 ? false : true;

        if (active) {
            this.currentBlockingMethods.splice(index, 1);
        } else {
            this.currentBlockingMethods.push(methodName);
        }
    }

    updateButtonDisplay(methodName, button) {
        let classToAdd;
        let classToRemove;
        if (this.currentBlockingMethods.includes(methodName)) {
            classToRemove = "deactivated-button";
            classToAdd = "activated-button";
        } else {
            classToRemove = "activated-button";
            classToAdd = "deactivated-button";
        }

        button.classList.remove(classToRemove);
        button.classList.add(classToAdd);
    }
}

function convertCamelCaseToDashCase(camel) {
    return camel.replace(
        /[A-Z]/g,
        (upperCaseLetter) => "-" + upperCaseLetter.toLowerCase()
    );
}
