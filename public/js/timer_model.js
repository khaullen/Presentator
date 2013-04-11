// state: end timestamp (from server), active/inactive timer

// MODEL -> CONTROLLER
// ticking every second, creating event
// event has object containing properties for hours/minutes/seconds/pos-neg
// activate/deactivate events to change button display

// CONTROLLER -> MODEL
// interface for being notified of start/stop events
// passes events through model to network

// MODEL -> NETWORK
// sends start/stop events

// NETWORK -> MODEL
// sends responses from server containing end timestamp, confirmation for stop events


var TimerModel = (function() {

  /*
   * Private methods
   */
   
  // Returns an object with properties for hours, minutes, seconds, and negative
  var createTimeObject = function(currentTime, endTime) {
    var totalSeconds = parseInt(endTime - currentTime.getTime() / 1000);
    var absolute = Math.abs(totalSeconds);

    return {
      hours: parseInt(absolute / 3600) % 24,
      minutes: parseInt(absolute / 60) % 60,
      seconds: absolute % 60,
      negative: totalSeconds < 0
    }
  };

  /*
   * Constructor
   */
   
  var timerModel = function(endTime) {
    this.endTime = endTime;
  };
	
  /*
   * Prototype methods
   */
   
  timerModel.prototype = {
    constructor: timerModel,
    callbacks: {},
    inProgress: false,
    endTime: undefined,
    intervalId: undefined,
    
    on: function(eventName, cb) {
      this.callbacks[eventName] || (this.callbacks[eventName] = []);
      this.callbacks[eventName].push(cb);
    },
    trigger: function(eventName) {
      if (!this.callbacks[eventName]) return;
      var args = Array.prototype.slice.call(arguments, 1);
      this.callbacks[eventName].forEach(function(cb) {
        cb.apply(undefined, args);
      });
    },
    toggleRequest: function() {
      var _this = this;
      if (!this.inProgress) {
        // send start request to server
        var success = function(response) {
          _this.endTime = response;
          _this.activate(true);
        };
        utilities.makeAjaxRequest('POST', '/start-presentation', success);
      } else {
        // send stop request to server
        var success = function() {
          _this.activate(false);
        };
        utilities.makeAjaxRequest('POST', '/stop-presentation', success);
      }
    },
    activate: function(active) {
      this.inProgress = active;
      this.trigger('activate', active);
      if (active) {
        var _this = this;
        this.trigger('tick', createTimeObject(new Date(), this.endTime));
        this.intervalId = setInterval(function () { _this.trigger('tick', createTimeObject(new Date(), _this.endTime)); }, 1000);
      } else {
        clearInterval(this.intervalId);
			  this.intervalId = undefined;
      }
    }
  };
  
  return timerModel;

})();
  
