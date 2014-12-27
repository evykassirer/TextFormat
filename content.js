// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * for debugging - turns on console log statements
 * @type {boolean}
 */
var DEBUG = false;

/**
 * Global variable containing a dictionary of a css attribute and the
 * style element where the style is set accross the page.
 * @type {Object.<string, string>}
 */
var allStyles = {};
// set default values
allStyles['line-height'] = "0";
allStyles['letter-spacing'] = "0";
allStyles['word-spacing'] = "0";
allStyles['font-weight'] = "0";
allStyles['font-style'] = "0";

/**
 * Creates the HTML style element that sets global styles for the page
 * when the page is opened.
 *
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var loadInitialValue = function(attribute, result) {
  var style = document.createElement('style');
  style.type = 'text/css';
  // This means it was set to default.
  if (!result || !result[attribute] || result[attribute] == "0")
    style.innerHTML = '';
  else {
    style.innerHTML = '* { ' + attribute + ': '+ result[attribute] + '; }"';
    if (DEBUG) console.log(attribute + " is loaded as: " + result[attribute]);
  }
  document.head.appendChild(style);
  allStyles[attribute] = style;
}

/**
 * Fetch the current stored styles.
 * If there is no result (no stored style) loadInitialValue interprets this
 * as default style.
 * @param {string} attribute to be fetched
 */
var fetchStyle = function(attribute) {
  chrome.storage.sync.get(attribute, function(result) {
  loadInitialValue(attribute, result); });
}
// Fetch each style.
for (var key in allStyles) {
  fetchStyle(key);
}

/**
 * When the style is changed from the popup menu, the html style tag is
 * updated.
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    if (!changes.hasOwnProperty(key)) 
      continue; 
    var storageChange = changes[key];
    // If the value is 0, that means return to default, so remove
    // any added styling.
    if (storageChange.newValue == "0") {
      allStyles[key].innerHTML = '';
      continue;
    }
    // Otherwise update the value
    allStyles[key].innerHTML = '* { '+ key + ': '+ storageChange.newValue + '; }"';
  }
});