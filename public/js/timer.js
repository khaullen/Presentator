var Timer = (function () {

  /*
   * Takes a number and if the number is a single digit returns a string of "0" + the digit, otherwise returns the number
   */
  var formatTime = function(time) {
    return (time < 10 && time > -10) ? "0" + time : time;
  };

  /*
   * Constructor
   */
  var timer = function (article, options) {
    this.options = options || {};
    this.id = article.getAttribute('id');
    this.countdownString = article.getElementsByClassName('countdownString')[0];
    this.trigger = article.getElementsByClassName('trigger')[0];
    this.endTime = this.countdownString.getAttribute('end-time');

    if (this.endTime) this.startTimer();

    var _this = this;
    this.clickHandler = function (event) { _this.handleClick(); };
    if (this.trigger) this.trigger.addEventListener('click', this.clickHandler);
  };
	
  /*
   * Prototype methods
   */
	timer.prototype = {
		constructor: timer,
    /*
     * Calculates hours, minutes and seconds for the timer.
     * Formats these values into a string to be displayed in the countdownString element.
     * hh:mm:ss or -hh:mm:ss
     */
		setTime: function () {
			var currentTime = new Date();
			var totalSeconds = parseInt(this.endTime - currentTime.getTime() / 1000);
      var absolute = Math.abs(totalSeconds);

			var hours = parseInt(absolute / 3600) % 24;
			var minutes = parseInt(absolute / 60) % 60;
			var seconds = absolute % 60;
		
			var timeArr = [];
			if (hours) timeArr.push(formatTime(hours));
      timeArr.push(formatTime(minutes));
      timeArr.push(formatTime(seconds));

      // Checks whether the time should be displayed as negative
      if (totalSeconds < 0) {
        this.countdownString.innerHTML = "-" + timeArr.join(":");
        utilities.changeClassName('negative', this.countdownString, true);
      } else {
        this.countdownString.innerHTML = timeArr.join(":");
      }
		},
    /*
     * Handles when the trigger button is clicked.
     * Sends a stop or start request depending on the state of the button and then
     * updates the state of the button.
     */
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
    /*
     * Starts the countdown.
     */
		startTimer: function () {
		  var _this = this;
			this.setTime();
      this.intervalId = setInterval(function () { _this.setTime(); }, 1000);
		},
    /*
     * Sends a post to the server that the presentation has been started
     * and begins the timer.
     */
		sendStartRequest: function () {
      var _this = this;
      var success = function(response) {
        _this.endTime = response;
        _this.startTimer();
      };
      utilities.makeAjaxRequest('POST', '/start-presentation/' + _this.id, success);
		},
    /*
     * Stops the countdown.
     */
		stopTimer: function () {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
      this.trigger.removeEventListener('click', this.clickHandler);
		},
    /*
     * Sends a post to the server that the presentation has ended, stops the timer and updates presentations on success.
     */
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
