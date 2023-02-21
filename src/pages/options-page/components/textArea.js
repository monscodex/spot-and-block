// This file contains the code needed to manage an option of type 'textArea'.

"use strict";

export default class textArea {
  constructor(description) {
    this.description = description;
  }

  createOption() {
    this.textArea = this.createTextAreaAttribute();
    this.manageAutoResizing();

    return this.textArea;
  }

  createTextAreaAttribute() {
    const textArea = document.createElement("textarea");
    textArea.setAttribute("spellcheck", false);

    return textArea;
  }

  autoResizeTextArea() {
    this.textArea.style.height = "0px";
    this.textArea.style.height = `${this.textArea.scrollHeight + 12}px`;

    this.textArea.style.width = "0px";
    this.textArea.style.width = `${this.textArea.scrollWidth + 12}px`;
  }

  manageAutoResizing() {
    // When the input is changed
    this.textArea.addEventListener("input", () => {
      this.autoResizeTextArea();
    });

    // When the textArea appears on the screen
    let observer = new IntersectionObserver(
      (entries, observer) => {
        this.autoResizeTextArea();
      },
      { root: document.documentElement }
    );

    observer.observe(this.textArea);
  }

  showValue(value) {
    try {
      this.textArea.value = value.join("\n");
    } catch (error) {
      this.textArea.value = "";
    }

    this.autoResizeTextArea();
  }

  returnCurrentVisualValue() {
    const visualValue = this.textArea.value;

    const sanitizedInput = this.sanitizeInput(visualValue);

    return sanitizedInput;
  }

  sanitizeInput(text) {
    let arrayOfText = text.split("\n");

    // Filter the empty lines
    arrayOfText = arrayOfText.filter((value) => value != "");

    this.textArea.value = arrayOfText.join("\n");
    return arrayOfText;
  }
}
