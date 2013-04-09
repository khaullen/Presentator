var Timer = (function () {

  var formatTime = function(time) {
    var absolute = Math.abs(time);
    return (time < 10 && time > -10) ? "0" + absolute : absolute;
  };

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
			if (hours) timeArr.push(formatTime(hours));
      timeArr.push(formatTime(minutes));
      timeArr.push(formatTime(seconds));

      if (totalSeconds < 0) {
        this.countdownString.innerHTML = "-" + timeArr.join(":");
        utilities.changeClassName('negative', this.countdownString, true);
      } else {
        this.countdownString.innerHTML = timeArr.join(":");
      }
		},
		handleClick: function () {
			if (utilities.hasClassName('start', this.trigger)) {
				this.sendStartRequest();
				this.trigger.innerHTML = "Stop";
				utilities.changeClassName('start', this.trigger, false);
			} else {
				this.sendStopRequest();
				this.trigger.innerHTML = "Start";
        utilities.changeClassName('start', this.trigger, true);
			}
		},
		startTimer: function () {
		  var _this = this;
			this.setTime();
      this.intervalId = setInterval(function () { _this.setTime(); }, 1000);
		},
		sendStartRequest: function () {
      var _this = this;
      var success = function(response) {
        _this.endTime = response;
        _this.startTimer();
      };
      utilities.makeAjaxRequest('POST', '/start-presentation/' + _this.id, success);
		},
		stopTimer: function () {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		},
		sendStopRequest: function () {
			var _this = this;
      var success = function() {
        _this.stopTimer();
        presentator.updatePresentations();
      };
      utilities.makeAjaxRequest('POST', '/stop-presentation/' + _this.id, success);
		}
	};
	
	return timer;

})();

var createTimer = function () {
	var nextPresentation = document.getElementsByClassName('upcoming')[0];
	if (nextPresentation) return new Timer(nextPresentation);
};

var t = createTimer();
