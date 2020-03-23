function getList(){
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  to = new Date().getTime();
  var oneWeekAgo = to - microsecondsPerWeek;
  since = oneWeekAgo; //parseInt(localStorage.lastChecked, 10); //"SINCE" needs to be doublechecked
  var numRequestsOutstanding = 0; //#. requests left to process?

  chrome.history.search({
    'text': '',              // Return every history item....
    'startTime': since,  // that was accessed less than one week ago.
    'maxResults':0
  },
 function(historyItems) {

    // For each history item, get details on all visits.
    for (var i = 0; i < historyItems.length; ++i) {

      var url = historyItems[i].url.replace("/www.","/");
      var domain = extractHost(url);

      var URLinArray = searchArray(domain, URLscoreArray);

      // Extension will only focus on URLs on whitelist.js
      // If history item is not on whitelist, disregard.
      if ((domain != null) && (domain.length > 1) && (URLinArray === 1)) { 

          var processVisitsWithUrl = function(url) {
            return function(visitItems) {
              //processVisits(tempurl, visitItems, item, since);
              processVisits(url, visitItems);
/*                if (!--numRequestsOutstanding) {
                onAllVisitsProcessed();
              }  */
            };
          };
          chrome.history.getVisits({url: url},processVisitsWithUrl(url));
          numRequestsOutstanding++;
      }
      
    }
    //console.log("total qualified URLs: " +qualifiedURLCount);
    //console.log("total requests: " +numRequestsOutstanding); 

    if (!numRequestsOutstanding) {
      onAllVisitsProcessed();
    }

  }); 


  // Array to log and count number of visits per item visited  
  var trends = {
    "historyItems": 0, 
    "visitItems": 0,
    "topUrls": [],
    "topDomains": [],
    "alignmentScore": []
  }

  // Array to hold counter number of visits per URL, domain and alignment
  var URLCount = {};
  var DomainCount = {};
  var alignmentCount = {};

  var processVisits = function(url, visitItems) {
    var domain = extractHost(url);
    var alignment = getAlignment(domain);

    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Dont count pages that are reloaded to avoid jacking up numbers
      //console.log(visitItems[i].visitTime);
      
      // console.log(visitItems[i]);
      
      if (visitItems[i].transition == 'reload') {
        continue;
      }
      
      if (!URLCount[url]) {
        URLCount[url] = 0;
      }
      URLCount[url]++;

      if (!DomainCount[domain]) {
        DomainCount[domain] = 0;
      }
      DomainCount[domain]++;

      if (!alignmentCount[alignment]){
        alignmentCount[alignment] = 0 ;
      }
       alignmentCount[alignment]++; 

       trends.visitItems++;
       trends.historyItems++;

    }
   
    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  var onAllVisitsProcessed = function() {
    // Sorting function - ascending
    var sortBySecondPosition = function(a, b) {
      return b[1] - a[1];
  }
    // Create array of top URLs
    urlArray = [];
    for (var url in URLCount) {
      urlArray.push([ url, URLCount[url] ]);
    }
    
    urlArray.sort(sortBySecondPosition);
    trends.topUrls = urlArray.slice(0,1000);
    console.log(trends.topUrls);

    // Create array of top domains
    var domainArray = [];
    for (var domain in DomainCount) {
      domainArray.push([ domain, DomainCount[domain] ]);
    }
    domainArray.sort(sortBySecondPosition);
    trends.topDomains = domainArray.slice(0,1000);
    console.log(trends.topDomains);

   // Array of alignment score counts 
   var alignmentArray = [];
   for (var alignment in alignmentCount) {
      alignmentArray.push([ alignment, alignmentCount[alignment] ]);
   }
   alignmentArray.sort(sortBySecondPosition);
   trends.alignmentScores = alignmentArray.slice(0,5);
   console.log(trends.alignmentScores); 

  };
  return trends; 

}


function extractHost(url) {
  var matches = url.match(/^.+?:\/\/(?:[^:@]+:[^@]+@)?([^\/?:]+)/);
  return matches ? matches[1] : undefined;
}

function searchArray (nameKey, URLscoreArray){
  for (var x=0; x < URLscoreArray.length; x++) {
    var object = URLscoreArray[x];
      if (object.url === nameKey) {
        URLhasMatch = 1;
        return URLhasMatch;
      }
      else
      continue;
  }
} 

function getAlignment (nameKey){
  for (var x=0; x < URLscoreArray.length; x++) {
    var object = URLscoreArray[x];
      if (object.url === nameKey) {
        // getScore(object.score); 
        //console.log(object.url+ " is from the " +object.alignment+ " of the spectrum!");
/*         console.log("Left: " +left);
        console.log("Left-center: " +centerleft);
        console.log("center: " +center);
        console.log("Right-center: " +centerright);
        console.log("Right: " +right);  */
        return object.alignment;
      }
      else
      continue;
  }
} 

getList();

/* function getScore(score){
  switch (score){
    case 1:
       left++;
       return;
    case 2:
      return centerleft++;
    case 3:
      center++;
      return 
    case 4:
      return centerright++;
    case 5:
      return right++;
    default:
      break;  
  }
}   */


  /* var onAllVisitsProcessed = function() {
    var sortBySecondPosition = function(a, b) {
        return b[1] - a[1];
    }
 
    // Re-order URLs to find the top 10 URLs
    var urlArray = [];
    for (var url in URLCount) {
        urlArray.push([ url, URLCount[url] ]);
    }
    urlArray.sort(sortBySecondPosition);
    trends.topUrls = urlArray.slice(0,1000);
    console.log(trends.topUrls);
    
    // Re-order domains to find the top 10 domains
    var domainArray = [];
    for (var domain in DomainCount) {
        domainArray.push([ domain, DomainCount[domain] ]);
    }
    domainArray.sort(sortBySecondPosition);
    trends.topDomains = domainArray.slice(0,1000);
    console.log(trends.topDomains);
    
    // Get alignment scores of domains
   var alignmentArray = [];
    for (var alignment in alignmentCount) {
        alignmentArray.push([ alignment, alignmentCount[alignment] ]);
    }
    alignmentArray.sort(sortBySecondPosition);
    trends.alignmentScores = alignmentArray.slice(0,5);
    console.log(trends.alignmentScores); 
    
  }

/*count();

 function count() {
  array_elements = ["a", "b", "c", "d", "e", "a", "b", "c", "f", "g", "h", "h", "h", "e", "a"];

  array_elements.sort();

  var current = null;
  var cnt = 0;
  for (var i = 0; i < array_elements.length; i++) {
      if (array_elements[i] != current) {
          if (cnt > 0) {
              console.log(current + ' comes --> ' + cnt + ' times<br>');
          }
          current = array_elements[i];
          cnt = 1;
      } else {
          cnt++;
      }
  }
  if (cnt > 0) {
    console.log(current + ' comes --> ' + cnt + ' times');
  }

} */