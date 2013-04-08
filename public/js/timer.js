var Timer = (function () {

	// Constructor
	var timer = function (article, options) {
		this.options = options || {};
		this.id = article.getAttribute('id');
		this.countdownString = article.getElementsByClassName('countdownString')[0];
		this.trigger = article.getElementsByClassName('trigger')[0];
		this.endTime = this.countdownString.getAttribute('end-time');
		
		if (this.endTime) this.startTimer();
		
		var _this = this;
        if (this.trigger) this.trigger.addEventListener('click', function (event) { _this.handleClick(); });
	};
	
	// Prototype
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
		handleClick: function () {
			if (this.trigger.className.split(" ")[1] === "start") {
				this.sendStartRequest(callback);
				this.trigger.innerHTML = "Stop";
				this.trigger.className = "trigger";
			} else {
				this.sendStopRequest(callback);
				this.trigger.innerHTML = "Start";
				this.trigger.className = "trigger start";
			}
		},
		startTimer: function () {
		  var _this = this;
			this.setTime();
            this.intervalId = setInterval(function () { _this.setTime(); }, 1000);
		},
		sendStartRequest: function (callback) {
			var _this = this;
		  var success = function(response) {
		  	_this.endTime = response;
		  	_this.startTimer();
		  };
		  var failure = function(response) {
		  	console.log(response);
		  };
			sendAjaxRequest('POST', '/start-presentation/' + _this.id, callback, success, failure);
		},
		stopTimer: function () {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		},
		sendStopRequest: function (callback) {
			var _this = this;
			var success = function(response) {
				_this.stopTimer();
				getUpdate(callback);
			};
			var failure = function(response) {
				console.log(response);
			};
			sendAjaxRequest('POST', '/stop-presentation/' + _this.id, callback, success, failure);
		}
		
// 		getTime: function(callback, id) {
// 		  var success = function(response) {
// 		  };
// 		  var failure = function(response) {
// 		  };
// 		  sendAjaxRequest('GET', '/', callback, success, failure);
// 		}
	};
	
	return timer;
})();

var createTimer = function () {
	var nextPresentation = document.getElementsByClassName('upcoming')[0];
	console.log(nextPresentation);
	if (nextPresentation) return new Timer(nextPresentation);
};

var t = createTimer();
