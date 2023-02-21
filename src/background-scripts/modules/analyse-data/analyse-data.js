// This file takes the results from the parsing and analyzes them.
// After analyzing them it will deduce what features it is going to block (however, it does not perform the blocking itself).
// This file operates on a higher level by using the DataMatcher class defined in ./data-matcher.js

"use strict";

import { UpdatedVariable } from "../updateVariableToSavedVariable.js";
import waitUntilOptionsLoaded from "../waitUntilOptionsLoaded.js";
import DataMatcher from "./data-matcher.js";
import processResults from "./processAnalysedResults.js";

// Create the blockConditions variable when the extension is loaded.
(async () => {
  await waitUntilOptionsLoaded();

  new UpdatedVariable(
    window,
    "blockConditions",
    "options.needed-conditions-to-activate-mode"
  );
  new UpdatedVariable(
    window,
    "whatToBlockPerCategory",
    "options.what-to-block-per-category"
  );
})();

export default async function analyse(domainName, data) {
  const dataMatcher = new DataMatcher(data);

  const match = await dataMatcher.checkForMatch();
  const toBlock = dataMatcher.deduceWhatToBlock();

  const results = processResults(domainName, match, toBlock);

  return results;
}
