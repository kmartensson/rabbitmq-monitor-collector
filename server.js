var http = require('http');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var sourceOptions = {
	host:config.rabbitMq.host,
	port:config.rabbitMq.port,
	path:"/api/queues",
	method: 'GET'
};

var targetOptions = {
			host:config.target.host,
			port:config.target.port,
			path:"/queues",
			method: 'POST',
			headers: {
		          'Content-Type': 'application/json'
		      }
		};

process.on('uncaughtException', function (err) {
    console.log(err);
}); 

var fetchCallback = function(response){
	var str = "";
	response.on('data', function(chunk){
		str+=chunk;
	});

	response.on("end", function(){
		var message = JSON.stringify({key:4444, queues:JSON.parse(str)});
		targetOptions.headers['Content-Length'] = message.length;
		var request = http.request(targetOptions, pushCallback);
		request.write(message);
		request.end();
	});
};

var pushCallback = function(response){
	var str = "";
	response.on('data', function(chunk){
		str+=chunk;
	});

	response.on("end", function(){
		console.log(str);
	});
};

var fetchQueues = function(){
	http.request(sourceOptions, fetchCallback).end();
};

setInterval(fetchQueues, 1000*10);
fetchQueues();