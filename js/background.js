const microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var endTime = new Date().getTime();

if (document.URL.indexOf("popup.html") < 0) {
    $('body').append('<div style="" id="loadingDiv"><div class="loader">Loading...</div></div>');
    $(window).on('load', function() {
        setTimeout(removeLoader, 1000);
    });

    function removeLoader() {
        $("#loadingDiv").fadeOut(500, function() {
            $("#loadingDiv").remove();
        });
    }

    var select = document.querySelector("select.history-range-class");
    var selected = localStorage.getItem('select');
    if (selected) {
        select.value = selected;
        setTimeVariable(selected);
    }

    select.onchange = function() {
        selected = select.options[select.selectedIndex].value;
        localStorage.setItem('select', selected);
        setTimeVariable(selected);
        location.reload();
    }

} else {
    var since = endTime - microsecondsPerWeek;
    buildHistory(since);
}

function setTimeVariable(selected) {
    if (selected == "7") {
        var since = endTime - microsecondsPerWeek;
    }
<<<<<<< Updated upstream
    // Create array of top URLs
    // urlArr not yet used on current deBubblr. 
    // For possible extension breaking down each domain visit to URLs
    var urlArr = [];
    for (var url in URLCount) {
      var domain = extractHost(url);
      urlArr.push([domain, url, URLCount[url]]);
=======
    if (selected == "30") {
        var since = endTime - (4 * microsecondsPerWeek);
>>>>>>> Stashed changes
    }
    if (selected == "90") {
        var since = 0;
    }
    buildHistory(since);
}

function buildHistory(since) {
    var itemsChecked = 0; // Number of requests to process

    chrome.history.search({
            'text': '', // Return every history item....
            'startTime': since, // set start time to scrape browing history
            'endTime': endTime, // set endTime to today
            'maxResults': 0
        },
        function(historyItems) {

            // For each history item, get details on all visits.
            for (var i = 0; i < historyItems.length; ++i) {
                var url = historyItems[i].url.replace("/www.", "/");
                var domain = extractHost(url);

                var URLinArray = searchArray(domain);

                // Extension will only focus on URLs on whitelist
                // If history item is not on whitelist, disregard.
                if ((domain != null) && (domain.length > 1) && (URLinArray === 1)) {
                    var fetchVisitsWithUrl = function(url) {
                        return function(visitItems) {
                            fetchVisits(url, visitItems);
                        };
                    };
                    chrome.history.getVisits({ url: url }, fetchVisitsWithUrl(url));
                    itemsChecked++;
                }
            }

            if (!itemsChecked) {
                onAllVisitsProcessed();
            }

        });

    // Array to log and count number of visits per item visited  
    var list = {
        "visitItems": 0,
        "topUrls": [],
        "topDomains": []
    }

    // Array to hold counter number of visits per URL, domain and alignment
    var URLCount = [];
    var DomainCount = [];
    var alignmentCount = [];

    var fetchVisits = function(url, visitItems) {
        var domain = extractHost(url);
        var alignment = getAlignment(domain);

        console.log(domain + " " + alignment);
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
        if (!alignmentCount[alignment]) {
            alignmentCount[alignment] = 0;
        }
        alignmentCount[alignment]++;

        list.visitItems++;

        // If no items left, start building DOM
        if (!--itemsChecked) {
            onAllVisitsProcessed();
        }
        return;
    };

    var onAllVisitsProcessed = function() {
        // Sorting function - ascending
        var sortBySecondPosition = function(a, b) {
                return b[1] - a[1];
            }
            // Create array of top URLs
        var urlArr = [];
        for (var url in URLCount) {
            var domain = extractHost(url);
            urlArr.push([domain, url, URLCount[url]]);
        }
        urlArr.sort(sortBySecondPosition);
        list.topUrls = urlArr.slice(0, 1000);

        // Create array of top domains
        var domainArr = [];
        for (var domain in DomainCount) {
            var alignment = getAlignment(domain);
            domainArr.push([domain, DomainCount[domain], alignment]);
        }
        domainArr.sort(sortBySecondPosition);
        list.topDomains = domainArr.slice(0, 1000);

        //Array to hold alignment count 
        var alignmentArr = [
            ["LEFT", 0],
            ["CENTER-RIGHT", 0],
            ["CENTER-LEFT", 0],
            ["CENTER", 0],
            ["RIGHT", 0]
        ];

        console.log(alignmentCount);

        for (var alignment in alignmentCount) {
            console.log(alignment);
            for (var x = 0; x < alignmentArr.length; x++) {
                var tempAlign = alignmentArr[x][0];
                if (alignment == tempAlign) {
                    console.log("match");
                    break;
                } else
                    console.log("No!");

                // AlignmentArr holds temp 0 values for all alignment
                // loop through alignmentCount array
                // check if every alignmentCount Array items matches AlignmentArr
                // if match, replace value of corresponding alignment on AlignmentArr

            }

            // if (alignmentArr.includes(alignment))
            //alignmentArr.push([alignment, alignmentCount[alignment]]);
        }

        console.log(JSON.stringify(alignmentArr));

        getRecommenderData(alignmentArr);
        buildPie(alignmentArr);
        buildCharts(list);
    };

    return list;
}

function extractHost(url) {
    var matches = url.match(/^.+?:\/\/(?:[^:@]+:[^@]+@)?([^\/?:]+)/);
    return matches ? matches[1] : undefined;
}

function searchArray(nameKey) {
    for (var x = 0; x < URLscoreArray.length; x++) {
        var object = URLscoreArray[x];
        if (object.url === nameKey) {
            var URLhasMatch = 1;
            return URLhasMatch;
        } else
            continue;
    }
}

function getAlignment(nameKey) {
    for (var x = 0; x < URLscoreArray.length; x++) {
        var object = URLscoreArray[x];
        if (object.url === nameKey) {
            return object.alignment;
        } else
            continue;
    }
}

// Callback that creates and populates the DataTable and PieChart
function buildPie(alignmentArr) {

    //Get the alignment score count from the alignment array
    var values = alignmentArr.map(function(arr) { return arr[1]; });
    var arrSum = values.reduce((a, b) => a + b, 0)

    var chartDataArr = [];
    var chartLabelArr = [];

    for (var x = 0; x < 5; x++) {
        var percentScore = Math.round((alignmentArr[x][1] / arrSum) * 100);
        chartDataArr.push(percentScore);
        chartLabelArr.push(alignmentArr[x][0]);
    }

    var ctx = document.getElementById('pieChart').getContext('2d');

    // Config for Pie Chart
    var pieChart = new Chart(ctx, {
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
                labels: {
                    fontColor: 'rgba(0,0,0,.8)',
                    usePointStyle: true
                }
            }
        }
    });
}

// Function to load Datatables
function buildCharts(list) {
    var TopDomainsDataSet = list.topDomains;

    $(document).ready(function() {
        $('#history-chart').DataTable({
            "order": [
                [1, "desc"]
            ],
            data: TopDomainsDataSet,
            columns: [
                { title: "Most Visited Domains" },
                { title: "Visit Count" },
                { title: "Alignment" }
            ]
        });
    });
}