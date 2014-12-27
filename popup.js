// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * for debugging - turns on console log statements
 * @type {boolean}
 */
var DEBUG = false;

/**
 * The style of the popup is changed as well when the user changes
 * their style preferences. 
 *
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var setStyle = function(attribute, value) {
  if (DEBUG) console.log("value is type: " + typeof value); 

  // The default height for the popup box is 200% and anything less will cause weird formatting.
  if (attribute == 'line-height') {
    if (value == "0")
      document.body.style.setProperty(attribute, "200%"); // 200% is default
    else {
      // increment first character of the line height percentage
      var newLineHeight = value.replace(value.charAt(0), String.fromCharCode(value.charCodeAt(0) + 1));
      if (DEBUG) console.log("Popup's line height is offset and is being set to: " + newLineHeight);
      document.body.style.setProperty(attribute, newLineHeight);
      // this will make 100% appear to be default, which allows the user to increase spacing 
      // e.g. user input 200% --> 300% spacing in popup and 150% --> 250% in popup
    }
  }
  else if (value == "0")   // A value of 0 means to change to default.
    document.body.style.setProperty(attribute, '');
  else
    document.body.style.setProperty(attribute, value);
}

/**
 * When a new value is selected for a style from the popup
 * the value is stored in chrome storage. 
 */
var listenForChanges = function() {
  // Each style option has the name "option"
  var options = document.getElementsByName("option");

  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    option.onchange = function() {
      // Change the style of the popup
      setStyle(this.id, this.value);
      // Change the stored value to alert the other tabs to change value
      var change = {};
      change[this.id] = this.value;
      // Log the changed value to the console of the pop-up window
      chrome.storage.sync.set(change, function() { 
        if (!DEBUG) return;
        for (var i in change) {
          console.log(i + " changed to "  + change[i]);
        }
      })
    }
  }
}

/**
 * When a the reset to default button is hit, the style are reset and the
 * values in the popup dropdowns are also changed.
 */
var listenForDefault = function() {
   // Options in menu to be reset to show "default".
  var options = document.getElementsByName("option");
  // Reset to default button
  var def =  document.getElementsByName("default")[0];

  def.onclick = function() {
    for (var i = 0; i < options.length; i++) {
      var attribute = options[i];
      // Set default style in the popup
      setStyle(attribute.id, "0");
      attribute.value = "0";
      // Set default style on all the tabs by updating the stored values
      var change = {};
      change[attribute.id] = "0";
      chrome.storage.sync.set(change, function() { 
        if (!DEBUG) return;
        for (var i in change) {
          console.log(i + " changed to "  + change[i]);
        }
      })
    }
  }
}

/**
 * Start the menu script as soon as the document's DOM is ready.
 * Set up the menu and call the listeners.
 */
document.addEventListener('DOMContentLoaded', function () {
  listenForChanges();
  listenForDefault();
  
  // Set current values in the menu.
  var options = document.getElementsByName("option");
  for (var i = 0; i < options.length; i++) {
    var attribute = options[i].id;
    if (DEBUG) console.log("loading attribute: " + attribute);
    chrome.storage.sync.get(attribute, function(result) {
      if (result) {
        for (var i in result) {
          if (DEBUG) console.log("attribute: " + i + " loaded with value: " + result[i]);
          setStyle(i, result[i]);
          document.getElementById(i).value = result[i];
        }
      }
      else if (DEBUG)
        console.log("attribute: " + i + " loaded as default");
    });
  }
});
