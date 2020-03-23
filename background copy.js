// Get random URL from whitelist
//var urlList = whitelist[Math.floor(Math.random()*whitelist.length)];

// Block to counter Inline JS call not being allowed on Chrome Extensions
document.addEventListener('DOMContentLoaded', function() {
  var loadUrl = document.getElementById('loadUrl');
  // Load random URL once button is clicked
  loadUrl.addEventListener('click', function() {
    chrome.tabs.create({ url: "http://" +urlList });
  });
  // ADD CONDITIONS FOR THE POLARITY ....
});

getURLList();

function getURLList(){
  // To look for history items visited in the past week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  chrome.history.search({ 
    text: "", 
    startTime: oneWeekAgo, 
    maxResults: 0 },

    function(historyItems) {
      historyItems.length = 15;
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var processVisitsWithUrl = function(url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });

}

function extractHost(url) {
  if(url != '' && url != undefined) {
    var strippedUrl = url.replace("/www.","/");
    var urlPattern = new RegExp("^https?://?([^/]+)");
    return urlPattern.exec(strippedUrl)[0];
  }
  return '';
} 

function processVisits(url, visitItems, historyItem, sinceTime) {
  var isValidTimestamp = function(itm) {
    return (parseFloat(itm.visitTime) > parseFloat(sinceTime))
  }
  visitItems.forEach(function(itm, idx) {
    if(isValidTimestamp(itm)) {
      var refUrl = GlobalItemCache.getReferrerForVisitItem(itm).url;
      var itmArray = [url, itm.visitTime, itm.transition, extractHost(refUrl)];
      urls.push(itmArray);
    }
  });
  console.log(url);
}

  // visitItems.forEach(function(item, idx) {
  // Dont count pages that are reloaded to avoid jacking up numbers
  //      if(item.transition != "reload")
  //      {
  //        var itemArray = [url, item.transition];
  //        urls.push(itemArray);
  //      }
  //    });