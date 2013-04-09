var utilities = {
    makeAjaxRequest: function (type, url, success) {
        var request = new XMLHttpRequest();
        var _this = this;
        request.onload = function(event) {
            if (event.target.readyState === 4) {
                if (event.target.status === 200) {
                    success(event.target.responseText);
                } 
                else if (event.target.status === 204) {
                }
                else {
                    _this.handleError(event.target.responseText);
                }
            }
        };
        request.open(type, url, true);
        request.send();
    },
    handleError: function(message) {
        console.error(message);
    }
};

var presentator = {
    updatePresentations: function () {
        var _this = this;
        var success = function(html) {
            _this.renderPresentations(html);
        };
        utilities.makeAjaxRequest('GET', (window.location.pathname === '/admin' ? '/admin' : '') + '/update', success);
    },
    renderPresentations: function (html) {
        var main = document.getElementById('presentations');
        main.innerHTML = html;
        t = createTimer();
    },
    initialize: function() {
        var _this = this;
        setInterval(function () { _this.updatePresentations(); }, 10000);
    }
};

presentator.initialize();
