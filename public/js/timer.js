var Timer = (function() {

  /*
   * Takes a number and if the number is a single digit returns a string of "0" + the digit, otherwise returns the number
   */
  var formatTime = function(time) {
    return (time < 10 && time > -10) ? "0" + time : time;
  };

  /*
   * Constructor
   */
  var timer = function(model, countdown, button) {
    var _this = this;
    this.model = model;
    this.countdown = countdown;
    this.button = button;

    this.model.on('tick', function(timeObject) { _this.setTime(timeObject); });
    if (this.model.endTime) this.model.activate(true); 

    var _this = this;
    if (this.button) {
      this.button.addEventListener('click', function (event) { _this.model.toggleRequest(); });
      this.model.on('activate', function(active) { _this.toggleButton(active); });
    }
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
		setTime: function(timeObject) {
			var timeArr = [];
			if (timeObject.hours) timeArr.push(formatTime(timeObject.hours));
      timeArr.push(formatTime(timeObject.minutes));
      timeArr.push(formatTime(timeObject.seconds));

      // Checks whether the time should be displayed as negative
      if (timeObject.negative) {
        this.countdown.innerHTML = "-" + timeArr.join(":");
        utilities.changeClassName('negative', this.countdown, true);
      } else {
        this.countdown.innerHTML = timeArr.join(":");
      }
		},
    /*
     * Handles when the trigger button is clicked.
     * Sends a stop or start request depending on the state of the button and then
     * updates the state of the button.
     */
		toggleButton: function(active) {
			if (active) {
				this.button.innerHTML = 'Stop';
				utilities.changeClassName('start', this.button, false);
			} else {
				this.button.innerHTML = 'Start';
        utilities.changeClassName('start', this.button, true);
			}
		}
	};
	
	return timer;

})();
