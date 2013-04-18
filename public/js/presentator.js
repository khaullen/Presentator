var Presentator = (function() {

  /*
   * Constructor
   */
  var presentator = function(presentations) {
    var _this = this;
    this.presentations = presentations;
    this.timer = this.createTimer();

    setInterval(function() { _this.updatePresentations(); }, 10000);
  };
	
  /*
   * Prototype methods
   */
	presentator.prototype = {
		constructor: presentator,
    updatePage: function(active) {
      if (active) return;
      this.updatePresentations();
    },
    updatePresentations: function() {
      var _this = this;
      var success = function(html) {
        _this.presentations.innerHTML = html;
        if (_this.timer) clearInterval(_this.timer.model.intervalId);
        _this.timer = _this.createTimer();
      };
      utilities.makeAjaxRequest('GET', (window.location.pathname === '/admin' ? '/admin' : '') + '/update', success);
    },
    createTimer: function() {
      var nextPresentation = this.presentations.getElementsByClassName('upcoming')[0];
      var _this = this;
		  if (nextPresentation) {
        var countdown = nextPresentation.getElementsByClassName('countdownString')[0];
        var button = nextPresentation.getElementsByClassName('trigger')[0];
        var endTimeString = countdown.getAttribute('end-time');
        var endTime = endTimeString === "" ? undefined : parseInt(endTimeString);

        var tModel = new TimerModel(endTime);
        var timer = new Timer(tModel, countdown, button);
        timer.model.on('activate', function(active) { _this.updatePage(active); });
        
        return timer;
      }
    }		  
	};
	
	return presentator;

})();
