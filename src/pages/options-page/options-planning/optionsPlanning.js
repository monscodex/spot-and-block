// This file contains the optionPlanning. It is one of the gearing of making
// an automatic option page. The optionsPlanning only contains the option's
// default values, its description and some other minor details.

"use strict";

import apiOptionsPlanning from "./apis-options.js";
import basicOptionsPlanning from "./basic-options.js";
import blockOptionsConditionalPlanning from "./block-options.js";
import spotOptionsConditionalPlanning from "./spot-options.js";

const optionsPlanning = [
    ...apiOptionsPlanning,
    ...basicOptionsPlanning,
    spotOptionsConditionalPlanning,
    blockOptionsConditionalPlanning
];

export default optionsPlanning;
