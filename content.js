// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Global variable containing a dictionary of a css attribute and the
 * style element where the style is set accross the page.
 */
var allStyles = {};

/**
 * Creates the HTML style element that sets global styles for the page
 * when the page is opened.
 */
function loadInitialValue(attribute, result) {
  var style = document.createElement('style');
  style.type = 'text/css';
  // This means it was set to default.
  if (!result || !result[attribute] || result[attribute] == 0) 
      style.innerHTML = '';
  else {
    style.innerHTML = '* { ' + attribute + ': '+ result[attribute] + '; }"';
      console.log(attribute + " is loaded as: " + result[attribute]);
  }
  document.head.appendChild(style);
  allStyles[attribute] = style;
}

/**
 * Fetches the current stored styles.
 * If there is no result (no stored style) loadInitialValue interprets this
 * as default style.
 */
chrome.storage.sync.get('line-height', function(result) { 
  loadInitialValue('line-height', result); });
chrome.storage.sync.get('letter-spacing', function(result) { 
  loadInitialValue('letter-spacing', result); });
chrome.storage.sync.get('word-spacing', function(result) { 
  loadInitialValue('word-spacing', result); });  
chrome.storage.sync.get('font-weight', function(result) { 
  loadInitialValue('font-weight', result); });  
chrome.storage.sync.get('font-style', function(result) { 
  loadInitialValue('font-style', result); });  

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
    if (storageChange.newValue == 0) {
      allStyles[key].innerHTML = '';
      continue;
    }
    // Otherwise update the value
    allStyles[key].innerHTML = '* { '+ key + ': '+ storageChange.newValue + '; }"';
  }
});