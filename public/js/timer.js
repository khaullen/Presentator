$(function() {
	var endTimeStamp = 1364516955000;
	var timer = $('<p class="timer"></p>');
	$(".topic").eq(0).after(timer);
	
	var timeFunction = function() {
		var currentTime = new Date();
		var seconds = parseInt((endTimeStamp - currentTime.getTime()) / 1000);
		var hours = parseInt(seconds / 3600) % 24;
		var minutes = parseInt(seconds / 60) % 60;
		var seconds = seconds % 60;
		
		var timeArr = [];
		if (hours) {
			timeArr.push(hours < 10 ? "0" + hours : hours);
		}
		timeArr.push(minutes < 10 ? "0" + minutes : minutes);
		timeArr.push(seconds < 10 ? "0" + seconds : seconds);
		
		timer.html(timeArr.join(":"));
	};
	
	timeFunction();
	setInterval(timeFunction, 1000);
})