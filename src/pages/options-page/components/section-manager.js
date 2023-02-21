// This file contains the sectionManager class. This class is needed to add
// options to the section in an organized way. A new sectionManager will be
// created for each of the page's sections.

"use strict";

export default class sectionManager {
  constructor(sectionName) {
    const sectionID = `${sectionName}-section`;
    this.section = document.getElementById(sectionID);

    this.optionsTableBody = this.addOptionsTable();
  }

  addOptionsTable() {
    const optionsTable = document.createElement("table");
    optionsTable.classList.add("options-table");

    // Create the interior elements of the table
    this.createOptionsTableHead(optionsTable);
    const tableBody = optionsTable.createTBody();

    this.section.appendChild(optionsTable);

    return tableBody;
  }

  createOptionsTableHead(table) {
    const tableHead = table.createTHead();

    tableHead.innerHTML = `
    <thead>
      <tr>
        <th>Option Description</th>
        <th>Option</th>
      </tr>
    </thead>
    `;
  }

  addOption(option, description) {
    const row = this.optionsTableBody.insertRow();

    const descriptionCell = row.insertCell();
    const descriptionElement = this.makeOptionDescription(description);
    descriptionCell.appendChild(descriptionElement);

    const optionCell = row.insertCell();
    optionCell.classList.add("option");
    optionCell.appendChild(option);
  }

  makeOptionDescription(description) {
    const descriptionElement = document.createElement("div");

    descriptionElement.classList.add("option-description");
    descriptionElement.innerHTML = description;

    return descriptionElement;
  }
}
