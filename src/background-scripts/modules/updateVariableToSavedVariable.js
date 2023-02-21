// This file declares two classes that will manage variables:
//  - Variables that will get updated with their saved value (on disk). (UpdatedVariable)
//  - Variables that will update the storage on every change. (on disk). (VariableThatWillUpdateStorage)

"use strict";

import {
  chromeStorageGet,
  chromeStorageSet,
} from "../../components/asynchronousChromeStorage.js";
import areValuesEqual from "../../components/compareValues.js";

class UpdatedVariable {
  constructor(variableContainer, variableName, path) {
    this.variableContainer = variableContainer;
    this.variableName = variableName;
    [this.storageKey, this.path] = processPath(path);

    this.updateVariable();

    this.updateToSavedOneOnChange();
  }

  async updateToSavedOneOnChange() {
    chrome.storage.local.onChanged.addListener(async () => {
      this.updateVariable();
    });
  }

  async updateVariable() {
    this.variableContainer[this.variableName] = await this.getVariable();
  }

  async getVariable() {
    let data = await chromeStorageGet(this.storageKey);

    this.path.forEach((key) => {
      if (data === undefined) {
        return;
      }

      data = data[key];
    });

    return data;
  }

  async changeStorageVariable(callback) {
    let data = await chromeStorageGet(this.storageKey);

    let valueToModify = this.variableContainer[this.variableName];
    callback(valueToModify);

    // Will only work when the path length === 1
    data[this.path[0]] = valueToModify;

    let toSet = {};
    toSet[this.storageKey] = data;

    await chromeStorageSet(toSet);
  }
}

/* 
  * We need this class to keep the data saved on memory to use it later
  *
  * This class is created to periodically save some data
    (variableContainer[variableName]) to storage using chrome.storage.local
*/
class VariableThatWillUpdateStorage {
  constructor(variableContainer, variableName, valueToAvoid) {
    this.variableContainer = variableContainer;
    this.variableName = variableName;
    this.valueToAvoid = valueToAvoid;

    this.setInitialValue();
  }

  async setValueToSavedValue() {
    const storedValue = await chromeStorageGet(this.variableName);
    this.isObject = storedValue instanceof Object;

    this.oldValue = this.sanitizeValue(storedValue);
    this.variableContainer[this.variableName] = this.sanitizeValue(storedValue);
  }

  async setInitialValue() {
    await this.setValueToSavedValue();

    this.keepChromeStorageUpdated();
  }

  sanitizeValue(value) {
    return this.isObject ? { ...value } : value;
  }

  keepChromeStorageUpdated() {
    this.savingValue = false;
    setInterval(async () => {
      if (this.savingValue) {
        return;
      }

      this.currentValue = this.variableContainer[this.variableName];

      if (this.currentValue === this.valueToAvoid) {
        this.setValueToSavedValue();
      } else if (!areValuesEqual(this.currentValue, this.oldValue)) {
        await this.saveVariableValue();
      }
    }, 50);
  }

  async saveVariableValue() {
    this.savingValue = true;

    const toBeSaved = {};
    toBeSaved[this.variableName] = this.currentValue;

    await chromeStorageSet(toBeSaved);

    this.oldValue = this.sanitizeValue(this.currentValue);

    this.saveVariableValue = false;
  }
}

function processPath(path) {
  // The path will be provided with separating dots
  // ex: 'hello.how.are.you'
  // {hello: {how: { are: {you: {}}}}}
  let processedPath = path.split(".");

  const storageKey = processedPath[0];
  processedPath.shift();

  return [storageKey, processedPath];
}

export { UpdatedVariable, VariableThatWillUpdateStorage };
