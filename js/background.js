
buildHistory(createDOM);
function createDOM(list) {
    buildCharts(list);
}


/* function getTimeVariable(){
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var to = new Date().getTime();
}

function getTimeVariable(){
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var to = new Date().getTime();

  if(document.URL.indexOf("popup.html") < 0){ 
    var selected = localStorage.getItem('selected');

    if (selected) {
      $(".history-range-class").val(selected);
    }

    $("select.history-range-class").change(function(){
      selected = localStorage.setItem('selected', $(this).val());

      if(selected=="currentweek"){

        var oneWeekAgo = to - microsecondsPerWeek;
        var since = oneWeekAgo;
        console.log(since);
      }
      if(selected=="recentweek"){

        var oneWeekAgo = to - microsecondsPerWeek;
        var since = oneWeekAgo;
        console.log(since);
      }
      if(selected=="recentmonth")
      {
        console.log(microsecondsPerWeek);
        var since = to - (4*microsecondsPerWeek);
        console.log(since);
      }
      if(selected=="allhistory"){

        var since = 0;
        console.log(since);
      }
      
 
     // return since;
    }); 
  } 
} */

function buildHistory(createDOM){
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var to = new Date().getTime();
  var oneWeekAgo = to - microsecondsPerWeek;
  var since = oneWeekAgo; 

  var numRequestsOutstanding = 0; // Number of requests to process

  var selectedInterval = 0;

  if(document.URL.indexOf("popup.html") < 0){ 

  $("select.history-range-class").change(function(){
    selectedInterval = $(this).children("option:selected").val();
    console.log(selectedInterval);

    if(selectedInterval=="currentweek"){
      var oneWeekAgo = to - microsecondsPerWeek;
      since = oneWeekAgo;
      console.log(since);
    }
    if(selectedInterval=="recentweek"){
      var oneWeekAgo = to - microsecondsPerWeek;
      since = oneWeekAgo;
      console.log(since);
    }
    if(selectedInterval=="recentmonth")
    {
      since = to - (4*microsecondsPerWeek);
      console.log(since);
    }
    if(selectedInterval=="allhistory"){
      since = 0;
      console.log(since);
    }
    console.log(since);
    
  }); 
}
  chrome.history.search({
    'text': '',       // Return every history item....
    'startTime': since,   // that was accessed less than one week ago.
    'maxResults':0
  },
 function(historyItems) {

    // For each history item, get details on all visits.
    for (var i = 0; i < historyItems.length; ++i) {
      var url = historyItems[i].url.replace("/www.","/");
      var domain = extractHost(url);

      var URLinArray = searchArray(domain);

      // Extension will only focus on URLs on whitelist
      // If history item is not on whitelist, disregard.
      if ((domain != null) && (domain.length > 1) && (URLinArray === 1) ) {
          var fetchVisitsWithUrl = function(url) {
            return function(visitItems) {
              //fetchVisits(tempurl, visitItems, item, since);
              fetchVisits(url, visitItems);
/*                if (!--numRequestsOutstanding) {
                onAllVisitsProcessed();
              }  */
            };
          }
          chrome.history.getVisits({url: url},fetchVisitsWithUrl(url));
          numRequestsOutstanding++;
      }
    }

    if (!numRequestsOutstanding) {
      onAllVisitsProcessed();
    }

  }); 


  // Array to log and count number of visits per item visited  
  var list = {
    "visitItems": 0,
    "topUrls": [],
    "topDomains": [],
    "alignmentScores": []
  }

  // Array to hold counter number of visits per URL, domain and alignment
  var URLCount = [];
  var DomainCount = [];
  var alignmentCount = [];

  var scoreTotal = 0; 

  var fetchVisits = function(url, visitItems) {
    var domain = extractHost(url);
    var alignment = getAlignment(domain);
    
/*     for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      console.log(visitItems.length);
      // Dont count pages that are reloaded to avoid jacking up numbers  
      if (visitItems[i].transition == 'reload') {
        continue;
      }   */

      // Count instance of each URL visit 
      if (!URLCount[url]) {
        URLCount[url] = 0;
      }
      URLCount[url]++;

      // Count instance of each domain visit 
      if (!DomainCount[domain]) {
        DomainCount[domain] = 0;
      }
      DomainCount[domain]++;

      // Count instance of each alignment 
      if (!alignmentCount[alignment]){
        alignmentCount[alignment] = 0 ;
      }
       alignmentCount[alignment]++;

       // Get running total of alignment score count to be used later
       scoreTotal ++;
       list.visitItems++;

   // }
   
    // If this is the final outstanding call to fetchVisits(),
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
    var urlArr = [];
    for (var url in URLCount) {
      urlArr.push([ url, URLCount[url] ]);
    }
    urlArr.sort(sortBySecondPosition);
    list.topUrls = urlArr.slice(0,1000);
    //console.log(list.topUrls);

    // Create array of top domains
    var domainArr = [];
    for (var domain in DomainCount) {
      var alignment = getAlignment(domain);
      domainArr.push([ domain, DomainCount[domain], alignment ]);
    }
    domainArr.sort(sortBySecondPosition);
    console.log(domainArr);
    list.topDomains = domainArr.slice(0,1000);
    console.log(list.topDomains);

    //Array to hold alignment count plus percentage
    var alignmentArr = [];
    // Loop to get each Score and add to alignment array
    for (var alignment in alignmentCount) {
      alignmentArr.push([ alignment, alignmentCount[alignment]]);
    }
    getRecommenderData(alignmentArr);
    buildPie(alignmentArr,scoreTotal);
    alignmentArr.sort(sortBySecondPosition);
    list.alignmentScores = alignmentArr.slice(0,5);

    createDOM(list);
  };

  return list;
}

function extractHost(url) {
  var matches = url.match(/^.+?:\/\/(?:[^:@]+:[^@]+@)?([^\/?:]+)/);
  return matches ? matches[1] : undefined;
}

function searchArray (nameKey){
  for (var x=0; x < URLscoreArray.length; x++) {
    var object = URLscoreArray[x];
      if (object.url === nameKey) {
        var URLhasMatch = 1;
        return URLhasMatch;
      }
      else
      continue;
  }
} 

function getAlignment(nameKey){
  for (var x=0; x < URLscoreArray.length; x++) {
    var object = URLscoreArray[x];
      if (object.url === nameKey) {
        return object.alignment;
      }
      else
      continue;
  }
} 

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function buildPie(alignmentArr, scoreTotal){
    var chartDataArr = [];
    var chartLabelArr = [];
    
      for (var x = 0; x < 5; x++) { 
        var percentScore = Math.round((alignmentArr[x][1]/scoreTotal)*100);
        console.log(alignmentArr[x][1]+ " is " +percentScore+ "% of " +scoreTotal);
        chartDataArr.push(percentScore);
        chartLabelArr.push(alignmentArr[x][0]);   
      }

  var ctx = document.getElementById('pieChart').getContext('2d');
 
    // Config for Pie Chart
    var pieChart = new Chart(ctx,{
      type: 'pie',
      data: {
      labels: chartLabelArr,
      datasets: [{
      data: chartDataArr,
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderColor: [
        'rgba(255, 255, 255, 1)'
      ],
      borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        labels: {
          render: 'percentage',
          precision: 1,
          fontSize: 14,
          fontColor: '#fff',
          fontStyle: 'bold',
          textShadow: true,
          shadowBlur: 2,
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      },
      legend: {
        fullWidth: true,
        labels:{
          fontColor: 'rgba(0,0,0,.8)',
          usePointStyle: true
        }
      }
    }
  });
}

// Function to load Datatables
function buildCharts(list){
  var TopDomainsDataSet = list.topDomains;
  
  $(document).ready(function() {
    $('#history-chart').DataTable( {
      data: TopDomainsDataSet,
      columns: [
        { title: "Most Visited Domains" },
        { title: "Visit Count" },
        { title: "Alignment"}
      ]
    } );
  });  
} 


/*   $(function() {
    $(".tabs").click(function() {
        var source = $(this).data("source");
        var tableId = $(this).data("table");
        initiateTable(tableId, source);
    });

  function buildCharts(list){

    var TopDomainsDataSet = list.topDomains;
    var TopURLsDataSet = list.topUrls;
    var TopAlignment = list.alignmentScores
    
    $(document).ready(function() {
      $('#history-chart').DataTable( {
        data: TopDomainsDataSet,
        columns: [
          { title: "Most Visited Domains" },
          { title: "Visit Count" }
        ]
      } );
    });  
  } 

  $(function() {
    $(".tabs").click(function() {
        var source = $(this).data("source");
        var tableId = $(this).data("table");
        initiateTable(tableId, source);
    });
function initiateTable(tableId, source) {
        var table = $("#" + tableId).DataTable({
            "ajax": source,
            order: [],
            columnDefs: [{
                orderable: false,
                targets: [0]
            }],
            "destroy": true,
            "bFilter": true,
            "bLengthChange": false,
            "bPaginate": false
        });
    }
    initiateTable("customers-table", "customers.json");
    $("#dynamic-tabs").tabs();
}); */

