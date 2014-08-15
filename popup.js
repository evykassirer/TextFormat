// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var setStyle = function(attribute, value) {
  if (value == 0) 
    document.body.style.setProperty(attribute, '');
  else
    document.body.style.setProperty(attribute, value);
}

var listenForChanges = function() {
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
