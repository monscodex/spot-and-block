'use strict';

const apiOptionsPlanning = [
  {
    name: 'virus-total-api-key',
    sectionName: 'apis-options',
    default: [],
    description: `<b>Virustotal API key</b>

The extension uses the <a>virustotal.com</a> service  in order to scan the site for viruses.
Please create an account and insert your API key here.
`,
    elementType: 'textArea',
  },
  {
    name: 'shodan-api-key',
    sectionName: 'apis-options',
    default: [],
    description: `<b>Shodan API key</b>

The extension uses the <a>shodan.com</a> service  in order to scan the site for viruses.
Please create an account and insert your API key here.
`,
    elementType: 'textArea',
  },
];

export default apiOptionsPlanning;
