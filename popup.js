// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var setStyle = function(attribute, value) {
  if (value == 0)
    if (attribute == "line-height") 
      document.body.style.setProperty(attribute, '150%');
    else
      document.body.style.setProperty(attribute, '');
  else
    document.body.style.setProperty(attribute, value);
}

var listenForChanges = function() {
  // Changes in the options menu
  var options = document.getElementsByName("option");
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    option.onchange = function() {
      setStyle(this.id, this.value);
      var change = {};
      change[this.id] = this.value;
      chrome.storage.sync.set(change, function() { 
        for (var i in change) {
          console.log(i + " changed to "  + change[i]);
        }
      })
    }
  }
  // Reset to default button
  var def =  document.getElementsByName("default")[0];
  def.onclick = function() {
    for (var i = 0; i < options.length; i++) {
      var attribute = options[i];
      // Set style in the popup
      setStyle(attribute.id, 0);
      attribute.value = 0;
      // Set style on the page
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
  
  // Set current values in the menu.
  var options = document.getElementsByName("option");
  for (var i = 0; i < options.length; i++) {
    var attribute = options[i].id;
    console.log("attribute: " + attribute);
    chrome.storage.sync.get(attribute, function(result) {
      if (result) {
        for (var i in result) {
          console.log("attribute: " + i + " with value: " + result[i]);
          setStyle(i, result[i]);
          document.getElementById(i).value = result[i];
        }
      }
    });
  }
});
