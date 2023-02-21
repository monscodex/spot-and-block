'use strict';

const basicOptionsPlanning = [
  {
    name: "important-urls",
    sectionName: "basic-options",
    default: [
      "*bankofamerica*",
      "*chase*",
      "*wellsfargo*",
      "*deutsche-bank*",
      "*citi*",
      "*allianz*",
      "*caixabank*",
    ],
    description: `<b>List of important sites:</b>

The sites that are included will be scanned when visited. This takes a lot of resources so it should only include high-priority sites. 
Sites that do not appear in this list will be scanned for viruses and vulnerabilities every predefined number of days (see Timing Options).

This list should include important websites like Google or Amazon authentication websites.
Note: The wildcard * allows to match any character e.g. google.* will match google.com, google.fr, google.co.uk, etc.
`,
    elementType: "textArea",
  },
  {
    name: "deactivate-extension-for-urls",
    sectionName: "basic-options",
    default: ["google.*", "www.google.*"],
    description: `<b>List of exempted sites:</b>

The extension is deactivated for these sites.

Note: The wildcard * allows to match any character e.g. google.* will match google.com, google.fr, google.co.uk, etc.

Note: The bang ! will force the activation of the extension for the site e.g. If www.google.* and !www.google.com are in this list, the extension will be enabled for www.google.com but not for www.google.fr, etc
`,
    elementType: "textArea",
  },
  {
    name: "unimportant-sites-timeout",
    sectionName: "timing",
    default: 7,
    description: `<b>Non-essential sites will be scanned every set number of days after visiting them:</b>

[This timing is for sites that are not deemed high-priority in the Basic Options list].`,
    elementType: "input",
    inputType: "number",
  },
  {
    name: "virus-total-scan-timeout",
    sectionName: "timing",
    default: 365,
    description: `<b>A scan for viruses will take place every set number of days:</b>

[This feature needs more power so this period of time should be larger than the previous one.] `,
    elementType: "input",
    inputType: "number",
  },
];

export default basicOptionsPlanning;
