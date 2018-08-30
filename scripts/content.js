'use strict';

/**
 * Initialize.
 * @param {Event} evt event
 */
function init(evt) {
  browser.runtime.onMessage.addListener(onRequest);
};

/**
 * Manages the popup requests.
 * @param {Object} request message
 * @param {Object} sender sender message
 * @param {Function} sendResponse callback for send a response
 */
function onRequest(request, sender, sendResponse) {

  if (request.action === 'get-data') {
    sendResponse(prepareData());
  }

};

/**
 * Link.
 * @param {String} url link url
 * @param {String} text link text
 * @param {Boolean} isLocal link type
 * @constructor
 */
function Link(url, text, isLocal) {
  this.url = url;
  this.text = text;
  this.local = isLocal;
};

/**
 * Prepares to outgoing data.
 * @returns {Object} outgoing object.
 */
function prepareData() {

  var preparedData = {
    url: document.location.href,
    links: [],
    total: 0,
    internal: 0,
    external: 0
  };

  for (var i = 0, linkCount = document.links.length; i < linkCount; i++) {
    var currentLink = document.links[i];
    var isLocal = currentLink.hostname === document.location.hostname;

    // Check links type then increase the type
    if (isLocal) {
      preparedData.internal++;
    } else {
      preparedData.external++;
    }

    // Adds link
    preparedData.links.push(new Link(currentLink.href, currentLink.textContent, isLocal));
  }

  // Set total link
  preparedData.total = preparedData.links.length;

  return preparedData;
};

/**
 * Compatibility with the all supported Extension API browser.
 */
window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

window.addEventListener('load', init, false);