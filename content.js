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
var STYLE_NAMES = ['line-height', 'letter-spacing', 'word-spacing', 'font-weight', 'font-style'];

/**
 * When the style is changed from the popup menu, the html style tag is
 * updated.
 * Maps css attribute to a style element where the style is set accross the page.
 * @param {Object.<string, Element>} Maps css attributes to style elements
 * where the style is set accross the page.
 */
var addStorageListener = function (styleElements) {
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
}

/**
 * Loads initial values in the style elements
 * @param {Object.<string, Element>} maps css attributes to style elements
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var loadValue = function (styleElements, attribute, result) {
  var style = styleElements[attribute];
  // This means it was set to default.
  if (!result || !result[attribute] || result[attribute] === "0") {
    style.innerHTML = '';
  } else {
    style.innerHTML = '* { ' + attribute + ': ' + result[attribute] + '; }"';
    if (DEBUG) {
      console.log(attribute + " is loaded as: " + result[attribute]);
    }
  }
};

/**
 * Fetch a current stored style.
 * If there is no result (no stored style) loadInitialValue interprets this
 * as default style.
 * @param {Object.<string, Element>} maps css attributes to style elements
 * @param {string} attribute to be fetched
 */
var fetchStyle = function (styleElements, attribute) {
  chrome.storage.sync.get(attribute, function (result) {
    loadValue(styleElements, attribute, result);
  });
};

/**
 * Creates the HTML style element that sets global styles for the page
 * when the page is opened.
 * @return {Object.<string, Element>} Maps css attributes to style elements
 * where the style is set accross the page.
 */
var createStyleElements = function () {
  styleElements = {};
  for (var i = 0; i < STYLE_NAMES.length; i++) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '';
    document.head.appendChild(style);
    styleElements[STYLE_NAMES[i]] = style;
  }
  return styleElements;
}

var onPageStart = function () {
  var styleElements = createStyleElements();
  // Fetch each style.
  for (var i = 0; i < STYLE_NAMES.length; i++) {
    fetchStyle(styleElements, STYLE_NAMES[i]);
  }
  addStorageListener(styleElements);
}

onPageStart();