// Get random URL from whitelist
var urlList = whitelist[Math.floor(Math.random()*whitelist.length)];
// Block to counter Inline JS call not being allowed on Chrome Extensions
document.addEventListener('DOMContentLoaded', function() {
  var loadUrl = document.getElementById('loadUrl');
  // Load random URL once button is clicked
  loadUrl.addEventListener('click', function() {
    chrome.tabs.create({ url: "http://" +urlList });
  });
  // ADD CONDITIONS FOR THE POLARITY then change call for whitelistscore array instead of whitelist
});

