var sendAjaxRequest = function (type, url, callback, success, failure) {
	var request = new XMLHttpRequest();
	request.onload = function(event) {
		callback(event, success, failure);
	};
	request.open(type, url, true);
	request.send();
};

var callback = function (event, success, failure) {
	if (event.target.readyState === 4) {
		if (event.target.status === 200) {
			success(event.target.responseText);
		} else {
			failure(event.target.responseText);
		}
	}
};

var getUpdate = function (cb) {
	var failure = function(response) {
		console.log(response);
	};
	sendAjaxRequest('GET', '/update' + (window.location.pathname === '/admin' ? '/admin' : '/today'), cb, updatePresentations, failure);
};

var updatePresentations = function (html) {
	if (html != "0") {
		var main = document.getElementById('main');
		main.innerHTML = html;
		t = createTimer();
	}
};

setInterval(function () { getUpdate(callback); }, 10000);
