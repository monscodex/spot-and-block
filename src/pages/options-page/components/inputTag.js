// This file contains the code needed to manage an option of type 'input'.

"use strict";

export default class inputTag {
  constructor(inputType, attributes) {
    this.inputType = inputType;
    this.attributes = attributes;

    this.createOption();
  }

  createOption() {
    this.input = this.createInputAttribute();

    return this.input;
  }

  setInputHtmlAttributes(input) {
    Object.entries(this.attributes).forEach(
      ([attributeName, attributeValue]) => {
        input.setAttribute(attributeName, attributeValue);
      }
    );

    return input;
  }

  createInputAttribute() {
    let input = document.createElement("input");

    input = this.setInputHtmlAttributes(input);
    input.type = this.inputType;

    return input;
  }

  showValue(value) {
    switch (this.inputType) {
      case "number":
        this.input.value = value;
        break;

      case "checkbox":
        this.input.checked = value;
        break;
    }
  }

  returnCurrentVisualValue() {
    switch (this.inputType) {
      case "number":
        return Number(this.input.value);
        break;

      case "checkbox":
        return this.input.checked;
        break;
    }
  }
}
