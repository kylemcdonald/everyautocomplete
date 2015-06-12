var request = require('request');
var express = require('express');
var app = express();

app.use('/', express.static('public'));

app.get('/search', function (req, res) {
	var q = req.query.q;
	console.log(q);
	if(!q) {
		res.sendStatus(500);
		return;
	}
	request({
			url: 'http://google.com/complete/search',
			qs: { client: 'chrome', q: q }
		}, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	var result = JSON.parse(body);
	  	var suggestions = result[1];
	  	var suggesttypes = result[4]['google:suggesttype'];
	  	var queries = [];
	  	for(var i = 0; i < suggestions.length; i++) {
	  		if(suggesttypes[i] == 'QUERY') {
	  			queries.push(suggestions[i]);
	  		}
	  	}
	  	console.log(queries);
	  	res.json(queries);
	  } else {
	  	res.sendStatus(500);
	  }
	})
});

var server = app.listen(process.env.PORT || 3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});