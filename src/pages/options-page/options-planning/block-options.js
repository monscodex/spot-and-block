"use strict";

import { blockingOptionDescription } from "../../../background-scripts/modules/block-elements-on-page/blocking-methods.js";

import makeConditionOptions from "../components/makeConditionOptions.js";

const blockConditions = {
  "what-to-block": {
    description: blockingOptionDescription,
    elementType: "textArea",
  },
};

let blockOptionsConditionalPlanning = {
  name: "what-to-block-per-category",
  sectionName: "block",
  description: "",
  elementType: "tabLayout",
  content: [
    {
      tabName: "critical",
      content: [
        {
          name: "what-to-block",
          default: [
            "closeSitePromptly",
            "blockJS",
            "blockThirdPartyRequests",
            "blockCookiesForSite",
            "blockOtherTypesOfStorageForSite",
          ],
        },
      ],
    },
    {
      tabName: "medium",
      content: [
        {
          name: "what-to-block",
          default: [
            "blockThirdPartyRequests",
            "deleteCookiesOnLeave",
            "deleteOtherTypesOfStorageOnLeave",
          ],
        },
      ],
    },
    {
      tabName: "low-risk",
      content: [
        {
          name: "what-to-block",
          default: ["deleteCookiesOnLeave", "deleteOtherTypesOfStorageOnLeave"],
        },
      ],
    },
  ],
};

blockOptionsConditionalPlanning = makeConditionOptions(
  blockOptionsConditionalPlanning,
  blockConditions
);

export default blockOptionsConditionalPlanning;
