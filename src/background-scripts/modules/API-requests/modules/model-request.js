// This document specifies a modelRequest to make more secure API requests.
// This modelRequest verifies that the results are valid as well as retrying the request if it failed to make it.

"use strict";

export default async function modelRequest(
  url,
  verify,
  data = {},
  maxRetry = 3,
  previousError = undefined
) {
  // Recursion base case
  if (maxRetry === 0) {
    throw previousError;
  }

  try {
    const response = await fetch(url, data);

    if (!response.ok || response.status === 204 || response.status === 429) {
      throw { response };
    }

    const results = await response.json();

    let validResults;
    if (verify.key) {
      validResults = areResultsValid(results, verify.key, verify.defaultValue);
    } else {
      validResults = true;
    }

    if (!validResults) {
      throw "Results are not valid";
    }

    return results;
  } catch (error) {
    return await modelRequest(url, verify, data, maxRetry - 1, error);
  }
}

async function areResultsValid(results, keyToValueToVerify, defaultValue) {
  await results;
  const resultsMatch = results[keyToValueToVerify] === defaultValue;
  if (!resultsMatch) {
    return false;
  }

  return true;
}
