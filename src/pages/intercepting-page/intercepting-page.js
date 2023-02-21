// The intercepting page (.html, .css, .js) is called when the extension closes a site.
// This file gets the explanation of why the website was closed and shows it to the user.

"use strict";

chrome.runtime.sendMessage(
  { message: "giveMeTheInterceptingPageData" },
  (response) => {
    if (response.message !== "handingYouTheInterceptingPageData") {
      return;
    }

    displayMessage(response.displayMessage);
  }
);

function displayMessage(displayMessage) {
  const tldr = document.getElementById("tldr");
  const fullExplanation = document.getElementById("full-explanation");

  if (displayMessage === undefined) {
    tldr.innerText = "You requested to close the site.";
    fullExplanation.innerText = "";
  } else {
    tldr.innerText = `\t${displayMessage.tldr}`;
    fullExplanation.innerText = `\t${displayMessage.fullExplanation}`;
  }
}
