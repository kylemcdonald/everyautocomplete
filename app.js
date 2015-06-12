var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var express = require('express');
var app = express();
var resultsCollection;

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
	  	if(queries.length) {
		  	resultsCollection.insert(queries.map(function(query) {
		  		return { search: q, result: query }
		  	}));
		  }
	  	res.json(queries);
	  } else {
	  	res.sendStatus(500);
	  }
	})
});

MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
  if(err) { return console.dir(err); }
  console.log('Connected to database.');
  resultsCollection = db.collection('results');

  var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
  });
});