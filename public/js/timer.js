// $(function() {
// // 	In practice we need to request endTimeStamp from server
// 	var endTimeStamp = 1464516955000;
// 	var timer = $('<p class="timer"></p>');
// 	$(".topic").eq(0).after(timer);
// 	
// 	var timeFunction = function() {
// 		var currentTime = new Date();
// 		var totalSeconds = parseInt((endTimeStamp - currentTime.getTime()) / 1000);
// 		var hours = parseInt(totalSeconds / 3600) % 24;
// 		var minutes = parseInt(totalSeconds / 60) % 60;
// 		var seconds = totalSeconds % 60;
// 		
// 		var timeArr = [];
// 		if (hours) {
// 			timeArr.push(hours < 10 ? "0" + hours : hours);
// 		}
// 		timeArr.push(minutes < 10 ? "0" + minutes : minutes);
// 		timeArr.push(seconds < 10 ? "0" + seconds : seconds);
// 		
// 		timer.html(timeArr.join(":"));
// 	};
// 	
// 	timeFunction();
// 	setInterval(timeFunction, 1000);
// })











var Timer = (function () {
	var timer = function (article, options) {
		this.options = options || {};
		this.countdownString = article.getElementsByClassName('countdownString')[0];
		this.trigger = article.getElementsByClassName('trigger')[0];
		this.endTime = this.countdownString.getAttribute('end-time');
	};
	
	timer.prototype = {
		constructor: timer,
		setTime: function () {
			var currentTime = new Date();
			var totalSeconds = parseInt(this.endTime - currentTime.getTime() / 1000);
			var hours = parseInt(totalSeconds / 3600) % 24;
			var minutes = parseInt(totalSeconds / 60) % 60;
			var seconds = totalSeconds % 60;
		
			var timeArr = [];
			if (hours) timeArr.push(hours < 10 ? "0" + hours : hours);
			timeArr.push(minutes < 10 ? "0" + minutes : minutes);
			timeArr.push(seconds < 10 ? "0" + seconds : seconds);
		
			this.countdownString.innerHTML = timeArr.join(":");
		},
		startTimer: function () {
		  var _this = this;
			this.setTime();
			setInterval(function () { _this.setTime.call(_this) }, 1000);
		}
	}
	
	return timer;
})();

var t = new Timer(document.getElementsByTagName('article')[0]);
t.startTimer();


