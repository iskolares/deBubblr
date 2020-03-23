function getCurrentWeek(weeks){
	var weeklistnums = new Array();
	for (var week in weeks){weeklistnums.push(parseInt(week,10));};
	return Math.max.apply(null,weeklistnums);	
}

function makeList(items,color){
	var html = "<div class='color' id='"+color+"'><ul>";
	for (var i = 0; i < items[color].length; ++i){
		html += "<li><a class='reclink' href='"+items[color][i].url+"'>"+items[color][i].name+"</a></li>";
	};
 	return html+"</ul></div>";
}

function getScore(source){
	var raws = ((parseFloat(source.blue) - parseFloat(source.red))/(parseInt(source.bluecount) + parseInt(source.redcount) + parseInt(source.greycount))+1)*6;
    var s = Math.round(raws);
	//console.log(s);
	if (s<1){return 1;}
	else if(s>11){return 11;}
	else{return s;};
}

function updateRecs(score){
	if (Math.abs(score-6)>0){
		var url = 'http://balancestudy.org/api/getrecs.php';
		if (score>6){var color="red";}
		else if(score<6){var color="blue";}	
		$.getJSON(url, function(data) {
		  	var items={"grey":[],"red":[],"blue":[]};
			for (var i = 0; i < data.recs.length; ++i){
				items[data.recs[i].color].push(data.recs[i]);
			};
			//console.log(items);
		  html="<h2>Looking for more balance?</h2>";
		  if (color=="red"){html += makeList(items,"red");}
		  html += makeList(items,"grey");
		  if (color=="blue"){html += makeList(items,"blue");}
		  $("#recommendations").show();
		  $("#recommendations").html(html);
		  $('.reclink').click(function(){chrome.tabs.create({url:$(this).attr('href')});});
		});
		
	}else{
		$("#recommendations").hide();
	}
}

function loadImage(){
	if(!localStorage.bluecount){
		$("#alltime img.balanceman").attr("src","./img/noarticles.jpeg");
		$("#byweek img.balanceman").attr("src","./img/noarticles.jpeg");
	}else{
		var weeks = JSON.parse(localStorage.weeks);
		var currentweek = getCurrentWeek(weeks);
		var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
		var oneWeekAgo = new Date().getTime() - microsecondsPerWeek;
		if (currentweek*1000 > oneWeekAgo){
			$("#byweektab").html("This week");
		}else {
			$("#byweektab").html("Last week");
		};
		var cw = weeks[String(currentweek)];
		var weekscore = getScore(cw);
		//console.log(weekscore);
		$("#byweek img.balanceman").attr("src","./img/tightrope"+(weekscore)+".jpeg");
		
		var alltimescore = getScore(localStorage);
		//console.log(alltimescore);
		$("#alltime img.balanceman").attr("src","./img/tightrope"+(alltimescore)+".jpeg");
		
		updateRecs(weekscore);
	}
    var lastUpdated = new Date();
    lastUpdated.setTime(parseInt(localStorage.lastChecked,10));
	$("#lastupdated").html("Updated: "+lastUpdated.toString());
}

function setActiveTab(){
	if (!localStorage.activeTab){
		activeTab = "byweektab";
		localStorage.activeTab = activeTab;
	}else{
		activeTab = localStorage.activeTab;
	};
	if (activeTab == "byweektab"){
		inactiveTab="alltimetab";
		$("#byweek").show();
		$("#alltime").hide();
	}else{
		inactiveTab = "byweektab";
		$("#byweek").hide();
		$("#alltime").show();
	};
	
	$("#"+activeTab).addClass("selected");
	$("#"+inactiveTab).removeClass("selected");
}

document.addEventListener('DOMContentLoaded', function () {
	setActiveTab();
	loadImage();
	$('.tab').click(function(){localStorage.activeTab = $(this).attr('id');setActiveTab();})
	$('#poplinka').click(function(){chrome.tabs.create({url:$(this).attr('href')});});
});
