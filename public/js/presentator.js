var Presentator = (function() {

  /*
   * Constructor
   */
  var presentator = function(presentations) {
    this.presentations = presentations;
    this.timer = this.createTimer();
  };
	
  /*
   * Prototype methods
   */
	presentator.prototype = {
		constructor: presentator,
    updatePage: function(active) {
      if (active) return;
      this.timer.destroy();
      this.updatePresentations();
    },
    updatePresentations: function () {
      var _this = this;
      var success = function(html) {
        _this.presentations.innerHTML = html;
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
        var endTime = countdown.getAttribute('end-time');
    

        var tModel = new TimerModel(endTime);
        var timer = new Timer(tModel, countdown, button);
        timer.model.on('activate', function(active) { _this.updatePage(active); });
        
        return timer;
      }
    }		  
	};
	
	return presentator;

})();
