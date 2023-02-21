// This file contains a function that determines if a string in contained in an
// array which might also contain strings with wildcards.

"use strict";

export default function doesStringMatchFullyMatchInArrayWithWildcards(
  string,
  array,
  discartOnBang = false
) {
  if (discartOnBang) {
    const toInclude = "!" + string;
    const discartedByBang = array.includes(toInclude);
    if (discartedByBang) {
      return false;
    }
  }

  // Get if the string is contained in the array (if it isn't the index will be
  // -1 because it isn't in the array)
  const stringInArray = array.indexOf(string) === -1 ? false : true;

  const matchWithWildcard = doesStringMatchInArrayOnlyWithWildcards(
    string,
    array
  );

  return stringInArray || matchWithWildcard;
}

function doesStringMatchInArrayOnlyWithWildcards(string, arrayWithWildcards) {
  let possibleMatches = arrayWithWildcards.map((importantSite) => {
    const regularExpression = wildcardToRegExp(importantSite);
    return string.match(regularExpression);
  });

  possibleMatches = possibleMatches.filter(
    (possibleMatch) => possibleMatch !== null
  );

  const match = possibleMatches.length !== 0;

  return match;
}

function escapeRegExp(string) {
  // Escape every RegExp special character of the string to RegExp escaped characters
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// (Thanks to Mozilla Docs):
function wildcardToRegExp(string) {
  // Escape every special character and convert the wildcards to *. in RegExp
  return new RegExp(
    "^" + string.split(/\*+/).map(escapeRegExp).join(".*") + "$"
  );
}
