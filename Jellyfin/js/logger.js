var logger = {
};

logger.loadfile = function() {
	if (localStorage.getItem('logger') == null) {
		var logJSON = ['Creating new log file'];
		localStorage.setItem('logger', JSON.stringify(logJSON));
	}
	return localStorage.getItem('logger');
};

logger.log = function(message,debugLevel) {
	debugLevel = (debugLevel !== undefined) ? debugLevel : 0;
	if (debugLevel <= main.getDebugLevel()) {
		var log = logger.loadfile();
		var logJSON = JSON.parse(log);
		
		logJSON.push(message);
		
		if (logJSON.length > 1000) {
			logJSON.splice(0,1);
		}
		
		localStorage.setItem('logger', JSON.stringify(logJSON));
	}
}

logger.clear = function() {
	var logJSON = ['Creating new log file'];
	localStorage.setItem('logger', JSON.stringify(logJSON));
}