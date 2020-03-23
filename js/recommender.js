//Function to create data for the Recommender
function getRecommenderData(alignmentArr){
  //Easier to use map() to get lowest count if alignmentArr is one array value
  var alignment = [alignmentArr];

  //Get the alignment score count from the alignment array
  var values = alignment[0].map(function(arr) { return arr[1]; });

  // Get Alignment with lowest score as basis for recommender
  var min = Math.min.apply(null, values);
  
  //Get alignment with highest score count
  var max = Math.max.apply(null, values);
  var arrSum = values.reduce((a, b) => a + b, 0)
  var percentScore = Math.round((max/arrSum)*100);
  var highestalignment = alignmentArr[values.indexOf(max)][0];


  //Test if the alignment scores are equal
  if(!(values.every((val, i, arr) => val === arr[0]))){
    document.getElementById('deBubblr-message').innerHTML = ("The past <span id='time-interval'>7 days</span>, majority (<span id='deBubblr-max'></span>%) of the articles you read are from <span id='deBubblr-max-align'></span>-aligned sites.");
    document.getElementById('deBubblr-max').innerHTML = (percentScore);
    document.getElementById('deBubblr-max-align').innerHTML = (highestalignment);

    // Variable to hold lowest alignment
    var lowestalignment = alignmentArr[values.indexOf(min)][0];
    //Block to get URLs that match lowest alignment then feed it to recommender
    const keys = Object.keys(URLscoreArray).filter(function(x) {
      return URLscoreArray[x].alignment == lowestalignment;
    })
    const randomIndex = keys[Math.floor(Math.random() * keys.length)];
    const urlList = URLscoreArray[randomIndex].url;
    
    TriggerClick(urlList);
  }

  //If all score's equal, randomize from whitelist pool
  else{
    document.getElementById('deBubblr-message').innerHTML = ("Your news consumption the past <span id='time-interval'>7 days</span> has been very balanced! Keep up the good work!");

    const keys = Object.keys(URLscoreArray);
    const randomIndex = keys[Math.floor(Math.random() * keys.length)];
    const urlList = URLscoreArray[randomIndex].url;
    TriggerClick(urlList);
  }
}


/* <p id='deBubblr-message'>Not enough browsing history to analyze. Please keep on browsing and check back again in 7 days.</p>
<p>

<p id='deBubblr-message'>
</p> */


function TriggerClick(urlList){
  // On-click even to load random URL from lowest alignment once button is clicked
  document.getElementById("loadUrl").addEventListener("click", function(){
    chrome.tabs.create({ url: "http://" +urlList});
  });
}

document.addEventListener('DOMContentLoaded', function() {
   var loadGraphs = document.getElementById('loadGraphs');

  if(document.URL.indexOf("index.html") < 0){ 
    //On-click event to load main page
    loadGraphs.addEventListener('click', function() {
    chrome.tabs.create({ url: "index.html"});
    });
  }
 });


 