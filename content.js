// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * For debugging - turns on console log statements
 * @type {boolean}
 */
var DEBUG = false;

/** 
 * To be able to loop through style names
 * @type {Array.<string>}
 */
var styleNames = ['line-height', 'letter-spacing', 'word-spacing', 'font-weight', 'font-style'];

/**
 * Global variable containing a dictionary of a css attribute and the
 * style element where the style is set accross the page.
 * @type {Object.<string, Element>}
 */
var styleElements = {};

/**
 * Creates the HTML style element that sets global styles for the page
 * when the page is opened.
 *
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var loadValue = function (attribute, result) {
  var style = document.createElement('style');
  style.type = 'text/css';
  // This means it was set to default.
  if (!result || !result[attribute] || result[attribute] === "0") {
    style.innerHTML = '';
  } else {
    style.innerHTML = '* { ' + attribute + ': ' + result[attribute] + '; }"';
    if (DEBUG) {
      console.log(attribute + " is loaded as: " + result[attribute]);
    }
  }
  document.head.appendChild(style);
  styleElements[attribute] = style;
};

/**
 * Fetch the current stored styles.
 * If there is no result (no stored style) loadInitialValue interprets this
 * as default style.
 * @param {string} attribute to be fetched
 */
var fetchStyle = function (attribute) {
  chrome.storage.sync.get(attribute, function (result) {
    loadValue(attribute, result);
  });
};
// Fetch each style.
for (var i = 0; i < styleNames.length; i++) {
  fetchStyle(styleNames[i]);
}

/**
 * When the style is changed from the popup menu, the html style tag is
 * updated.
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (key in changes) {
    if (!changes.hasOwnProperty(key)) {
      continue;
    }
    var storageChange = changes[key];
    // If the value is 0, that means return to default, so remove
    // any added styling.
    if (storageChange.newValue === "0") {
      styleElements[key].innerHTML = '';
      continue;
    }
    // Otherwise update the value
    styleElements[key].innerHTML = '* { ' + key + ': ' + storageChange.newValue + '; }"';
  }
});