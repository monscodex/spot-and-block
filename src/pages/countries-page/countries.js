// This file contains the array of supported countries by the geolocation API.

'use strict';

const supportedCountriesJSON = `["Afghanistan","Albania","Algeria","Andorra","Angola","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Caribbean Netherlands","Central African Republic","Chad","Chile","Colombia","Comoros","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Federated States of Micronesia","Fiji","Finland","France","Gabon","Georgia","Germany","Ghana","Greece","Guam","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kingdom of the Netherlands","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","New Zealand","Nicaragua","Niger","Nigeria","Niue","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","People's Republic of China","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Republic of the Congo","Romania","Russia","Rwanda","Sahrawi Arab Democratic Republic","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","State of Palestine","Sudan","Suriname","Sweden","Switzerland","Syria","São Tomé and Príncipe","Taiwan","Tajikistan","Tanzania","Thailand","The Bahamas","The Gambia","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Åland","American Samoa","Anguilla","Bouvet Island","British Virgin Islands","Cayman Islands","Christmas Island","Cocos (Keeling) Islands","Cook Islands","Curaçao","Diego Garcia","East Timor","Falkland Islands","Faroe Islands","French Guiana","French Polynesia","French Southern and Antarctic Lands","Gibraltar","Greenland","Guadeloupe","Guernsey","Heard Island and McDonald Islands","Isle of Man","Jersey","Macau","Martinique","Mayotte","Montserrat","New Caledonia","Norfolk Island","Northern Mariana Islands","Pitcairn Islands","Réunion","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Martin","Saint Pierre and Miquelon","Sint Maarten","South Georgia and the South Sandwich Islands","Tokelau","Turks and Caicos Islands","United States Minor Outlying Islands","United States Virgin Islands","Wallis and Futuna"]`
const supportedCountries = JSON.parse(supportedCountriesJSON);

const supportedCountriesText = supportedCountries.join("\n");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("countries").innerText = supportedCountriesText;
});
