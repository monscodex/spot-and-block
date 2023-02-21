"use strict";

export default function makeConditionOptions(conditionOptions, conditions) {
  let processedOptions = conditionOptions;

  processedOptions.content = processedOptions.content.map((tab) => {
    tab.content = tab.content.map((condition) => {
      const generalProperties = conditions[condition.name];

      condition = { ...condition, ...generalProperties };

      return condition;
    });

    return tab;
  });

  return processedOptions;
}
