'use strict';

var appBody = null,
  incomingData = null;

/**
 * Initialize.
 * @param {Event} evt event
 */
function init(evt) {

  // Selects app body
  appBody = document.querySelector('#app-body');

  // Requests data from tab
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    browser.tabs.sendMessage(activeTab.id, { action: 'get-data' }, renderData);
  });

};

/**
 * Creates the main area template
 * @returns {String} prepared main area HTML
 */
function renderMain() {

  var template = '<div class="box anchor">' + getMsg('total') + ' (<span id="total">' + incomingData.total + '</span>)</div>';
  template += '<div class="row">';
  template += '<div class="box internal">' + getMsg('internal') + ' (<span id="internal">' + incomingData.internal + '</span>)</div>';
  template += '<div class="box external">' + getMsg('external') + ' (<span id="external">' + incomingData.external + '</span>)</div>';
  template += '</div>';

  if (incomingData.total > 0) {
    template += '<div class="row">';
    template += '<div class="export" id="export"><span id="text">' + getMsg('exportTXT') + '</span> <span id="csv">' + getMsg('exportCSV') + '</span></div>';
    template += '<div class="search" id="search">' + getMsg('search') + ' <small>>>></small></div>';
    template += '</div>';
  }

  return template;
};

/**
 * Renders the incoming data.
 * @param {String} data response data
 */
function renderData(data) {

  // if data is not object, return
  if (typeof data !== 'object') return;

  incomingData = data;

  // Append the rendered data to app body
  appBody.innerHTML = renderMain();

  // Select necessary elements
  document.querySelector('#text').addEventListener('click', downloadText, false);
  document.querySelector('#csv').addEventListener('click', downloadCSV, false);
  document.querySelector('#search').addEventListener('click', showSearch, false);
};

/**
 * Returns message.
 * @param {String} messageName message name
 * @returns {String}
 */
function getMsg(messageName) {
  return browser.i18n.getMessage(messageName);
};

/**
 * Prepares the download file.
 * @param {String} fileData download file data
 * @param {String} fileName download file name
 * @param {String} fileType download file type
 */
function download(fileData, fileName, fileType) {
  try {
    var file = new Blob([fileData], { type: fileType });
    var link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(file);
    link.dispatchEvent(new MouseEvent('click'));
  } catch (error) {
    return false;
  }

  return true;
};

/**
 * Prepares the download file data.
 * @param {Boolean} isCSV is it csv?
 */
function downloadData(isCSV) {
  var data = getMsg('total') + ': ' + incomingData.total + '\n';
  data += getMsg('internal') + ': ' + incomingData.internal + '\n';
  data += getMsg('external') + ': ' + incomingData.external + '\n';

  for (var i = 0, linkCount = incomingData.links.length; i < linkCount; i++) {
    var currentLink = incomingData.links[i];
    data += '\n';

    if (isCSV === true) {
      data += '"' + currentLink.url + '"';
      data += ';';
      data += '"' + currentLink.text.replace(/\s{2,}/g, ' ') + '"';
    } else {
      data += currentLink.url;
    }
  }

  return data;
};

/**
 * Downloads the text report file.
 */
function downloadText() {
  var textData = downloadData(false);
  download(textData, getMsg('reportName') + '.txt', 'text/plain');
};

/**
 * Downloads the CSV report file.
 */
function downloadCSV() {
  var csvData = downloadData(true);
  download(csvData, getMsg('reportName') + '.csv', 'text/csv');
};

/**
 * Creates the search area template
 * @returns {String} prepared search area HTML
 */
function renderSearch() {
  var template = '<input type="text" placeholder="' + getMsg('search') + '" id="searchInput" />';
  template += '<table id="linkTable">';
  template += '<tr>';
  template += '<th>' + getMsg('url') + '</th>';
  template += '<th>' + getMsg('text') + '</th>';
  template += '</tr>';
  for (var i = 0, linkCount = incomingData.links.length; i < linkCount; i++) {
    var currentLink = incomingData.links[i];
    template += '<tr class="' + (!currentLink.local === true ? 'ext' : 'int') + '">';
    template += '<td>' + currentLink.url + '</td>';
    template += '<td>' + currentLink.text + '</td>';
    template += '</tr>';
  }
  template += '</table>';

  return template;
};

/**
 * Shows the search area.
 * @param {Event} evt event
 */
function showSearch(evt) {

  appBody.innerHTML = renderSearch();

  document.querySelector('#searchInput').addEventListener('keyup', searchLink, false);
};

/**
 * Search the links.
 * @param {Event} evt event
 */
function searchLink(evt) {

  var text = document.querySelector('#searchInput').value;
  var rows = document.querySelectorAll('#linkTable tr');
  var cell = null;

  for (var i = 0; i < rows.length; i++) {

    cell = rows[i].querySelector('td');

    if (cell) {
      rows[i].style.display = (cell.innerHTML.indexOf(text) > -1) ? '' : 'none';
    }

  }
};

/**
 * Compatibility with the all supported Extension API browser.
 */
window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

window.addEventListener('load', init, false);