var express = require('express');
var app = express();

// app.get('/', function (req, res) {
// res.send('Hello World!');
// });

//app.get('/', function(req, res) {
//res.sendfile(__dirname + '/index.html');
//});

//app.set('view engine', 'jade');
app.engine('html', require('./htmlEngine'));
app.set('view engine', 'html');

var server = app.listen(3000, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});

app.use(htmlhandler);
app.use(express.static('public'));

app.get('*', function(req, res) {
	console.log('invalid request ' + req.method + ' for ' + req.url);
	res.status(404);

	// respond with html page
	if (req.accepts('html')) {
		res.render('404', {
			url : req.url
		});
		return;
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({
			error : 'Not found'
		});
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});