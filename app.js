var request = require('request');
var headers = {
    // 'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'X-Client-Data': 'CIm2yQEIpLbJAQiptskBCMG2yQEI6ojKAQi1lcoB',
    'Connection': 'keep-alive',
    'Cookie': 'OGPC=5061586-5:; HSID=AuUF4x8EDnCOuB55m; APISID=tAhpCfVsJNno-R5x/A-KAvX0eQbqgextmL; SID=DQAAAEQBAAAtP1LyrX4sHrDF2IhIAb-RwmVeYQqSqSqI7Vtv2n4NcQUX27OcNb1bAs3F8iWL-CLV-Vw4espeFD52NiIupDTu2B_TyfGiFN40QLyea3DNs_hEM_HNRjh88z11rIK4eQAwk58zJfuLaSe4h1jmdYyc5--L6FEyWVIa6MkzQJcdDV92ONxTvzoqsBNgQdRyV_fiM4j8X3jFIldzq1KkP73Qfcs1-ZD-XX3OzRI-lUehjJ35XL8DT_kffhwi1ihGRcqWV8drU8wtg0obbpVHfPr6tB2HzU31WzkZNTRh_DbDO384IYdEmZSwYQi-qtNYP4Kc4m8NBtcOk_hekT7NDJixg9v1ykS1wA9n8VhsQQHNiAmqOZdOGoVarJu3XgvOxvFwqYjiwl6ra0Q9vcK7dDOdy7OKWVDZ0aWSsy0qRy7XbzdIGebh-mY-x6rTivTJfrI; NID=68=j0Jxso3QcL1Cs9mmoSFUPbSf-4WsLY-5PMX63InoZpxsdQmwi0uXX4RK6Febzwi5R5Kf7Ya9X-a-4QhvHArcCCEebdboppP0-LAnp8XFIVWTwi8xK_qYNcrbLWFXOmGIvWiAdT8oOArIzF5LW1taqp7fHKqYrJpxXW2Xne07-U3nh74993xA7oSthesU9N1bFQ43M7C_xJvj219Ivt_3c1AGTr01GJGTZQ95ue42v3m3pPw-xsDMKbDoClyy_w; PREF=ID=c5a256b4c3c5c0d5:U=1e97ed94fa0fb23f:FF=4:LD=en:CR=2:TM=1403921172:LM=1434090140:DV=wtIMrQPkSvwT6PB7p81id_10QnINmQI:GM=1:SG=1:S=4DYJD-RO1LqA7G83'
};
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var express = require('express');
var app = express();
var resultsCollection;

app.use('/', express.static('public'));

app.get('/search', function (req, res) {
	var q = req.query.q;
	if(!q) {
		res.sendStatus(500);
		return;
	}
	request({
			url: 'http://google.com/complete/search',
			// headers: headers,
			gzip: true,
			qs: { client: 'chrome', q: q },
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