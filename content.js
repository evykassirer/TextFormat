var allStyles = {};

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

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    if (!changes.hasOwnProperty(key)) 
      continue; 
    var storageChange = changes[key];
    if (key == 'line-height')
      console.log("line height is the key");
    if (storageChange.newValue == 0) {
      allStyles[key].innerHTML = '';
      continue;
    }
    allStyles[key].innerHTML = '* { '+ key + ': '+ storageChange.newValue + '; }"';
  }
});