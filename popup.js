// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * for debugging - turns on console log statements
 * @type {boolean}
 */
var DEBUG = false;

/** 
 * To be able to loop through style names
 * @type {Array.<string>}
 */ 
var allStyles = ['line-height', 'letter-spacing', 'word-spacing', 'font-weight', 'font-style'];

/**
 * Show the current style values in the popup menu drop down menus
 */ 
var setMenuValues = function() {
// All menu values have the name "option"
  var options = document.getElementsByName("option");
  for (var i = 0; i < options.length; i++) {
    var attribute = options[i].id;
    // Get the current value for the attribute from storage and display it in the menu
    chrome.storage.sync.get(attribute, function(result) {
      if (result) {
        for (var i in result) {
          if (DEBUG) console.log("attribute: " + i + " loaded in menu with value: " + result[i]);
          setStyle(i, result[i]);
          // Changing the value makes it display that string
          document.getElementById(i).value = result[i];
        }
      }
      // If result doesn't exist, then the value is default
      else if (DEBUG)
        console.log("attribute: " + i + " loaded in menu as default");
    });
  }
}

/**
 * The style of the popup is changed as well when the user changes
 * their style preferences. 
 *
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var setStyle = function(attribute, value) {
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
 * Changes the value of an attribute in the popup and in chrome storage
 *
 * @param {string} attribute to be set
 * @param {string} new value of the attribute
 */
var changeStyleValue = function(attribute, value) {
  // Change the style of the popup
  setStyle(attribute, value);
  // Change the stored value to alert the other tabs to change value
  var change = {};
  change[attribute] = value;
  // Log the changed value to the console of the pop-up window
  chrome.storage.sync.set(change, function() { 
    if (!DEBUG) return;
    for (var i in change) {
      console.log(i + " changed to "  + change[i]);
    }
  });
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
      changeStyleValue(this.id, this.value);
    }
  }
}

/**
 * When the reset to default button is hit, the styles are reset and the
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
 * Saves an attribute/value pair to chrome storage
 *
 * @param {string} attribute 
 */
var saveValue = function(attribute) {
  // fetch value from storage
  chrome.storage.sync.get(attribute, function(result) {
    // change will be the attribute value pair to be saved
    var change = {};
    // This means it was set to default.
    if (!result || !result[attribute] || result[attribute] == "0")
      change["saved " + attribute] = "0";
    else
      change["saved " + attribute] = result[attribute]; 
    // Set the current value as the saved value in storage
    chrome.storage.sync.set(change, function() { 
      if (!DEBUG) return;
      for (var i in change) {
        console.log(i + " saved as "  + change[i]);
      }
    });
  });
}


/**
 * When the save button is hit, the current styles ares saved.
 */
var listenForSave = function() {
  // Save button
  var save =  document.getElementsByName("save")[0];
  save.onclick = function() {
    // Fetch each style.
    for (var style in allStyles) {
        saveValue(style);
    }
  }
}

/**
 * When the load button is hit, the current styles are changed to the saved styles.
 */
var listenForLoad = function() {
  // Load button
  var load =  document.getElementsByName("load")[0];
  load.onclick = function() {  
    // for each style, get the saved value and change it everywhere.
    var num_styles_loaded = 0;
    var loadSaved = function(attribute) {
      chrome.storage.sync.get("saved " + attribute, function(result) {
        changeStyleValue(attribute, result["saved " + attribute]);
        num_styles_loaded++;
        if (num_styles_loaded === allStyles.length) {
          // If we've loaded all the saved styles, update the values displayed in the popup menu.
          setMenuValues();
        }
      })
    }
    // Each style option has the name "option"
    var options = document.getElementsByName("option");
    for (var i = 0; i < options.length; i++) {
      var attribute = options[i].id;
      loadSaved(attribute);
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
  listenForSave();
  listenForLoad();
  setMenuValues();  
});
