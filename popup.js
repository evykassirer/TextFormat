// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * The style of the popup is changed as well when the user changes
 * their style preferences. 
 */
var setStyle = function(attribute, value) {
  // The default height for the popup box is 1.5, and anything less will cause weird formatting.
  if (attribute == 'line-height' && (value == 0 || value < "150%"))
    document.body.style.setProperty(attribute, '150%');
  else if (value == 0)   // A value of 0 means to change to default.
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
      // Change the value in chrome storage.
      var change = {};
      change[this.id] = this.value;
      chrome.storage.sync.set(change, function() { 
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
      // Set style in the popup
      setStyle(attribute.id, 0);
      attribute.value = 0;
      // Set style on all the tabs
      var change = {};
      change[attribute.id] = 0;
      chrome.storage.sync.set(change, function() { 
        for (var i in change) {
          console.log(i + " changed to "  + change[i]);
        }
      })
    }
  }
}

// Start the menu script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  listenForChanges();
  listenForDefault();
  
  // Set current values in the menu.
  var options = document.getElementsByName("option");
  for (var i = 0; i < options.length; i++) {
    var attribute = options[i].id;
    console.log("loading attribute: " + attribute);
    chrome.storage.sync.get(attribute, function(result) {
      if (result) {
        for (var i in result) {
          console.log("attribute: " + i + " loaded with value: " + result[i]);
          setStyle(i, result[i]);
          document.getElementById(i).value = result[i];
        }
      }
      else
        console.log("attribute: " + i + " loaded as default");
    });
  }
});
