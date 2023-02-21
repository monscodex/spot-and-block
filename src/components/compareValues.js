// This file contains a function that compares any two variables. In
// javascript, comparing two objects isn't possible out of the box.

// What a shame that js can't compare 2 variables out of the box :(
// ex: ({a: 2} === {a: 2}) === false

"use strict";

export default function areValuesEqual(value1, value2) {
  if (value1 instanceof Object) {
    return areObjectsEqual(value1, value2);
  }

  return value1 === value2;
}

function areObjectsEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    if (value1 instanceof Object) {
      if (!areObjectsEqual(value1, value2)) {
        return false;
      }
    } else {
      if (value1 !== value2) {
        return false;
      }
    }
  }

  return true;
}
