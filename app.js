var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var routes = require('./app/routes/index');
var port = process.env.PORT || '3000';
var http = require('http');
var request = require('request');
var url = require('url');
var app = express();

/**
 * Set HTTP server port.
 */
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
process.env.PWD = process.cwd();

// view engine setup
app.set('views', path.join(__dirname, './app/views'));
var hbs = exphbs.create({
  layoutsDir: path.join(__dirname, './app/views/layouts'),
  partialsDir: path.join(__dirname, './app/views/partials'),
  defaultLayout: "layout"
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.static(process.env.PWD + '/public'));

app.use('/', routes);

//proxy the request

app.use('/listing',  function( req, res ){
  var letter = req.query.letter;
  var page = req.query.page || 1;
req.pipe( request({
      url: `https://ibl.api.bbci.co.uk/v1/atoz/${letter}/programmes?page=${page}`,
      qs: req.query,
      method: req.method
  }, function(error, response, body){
    if (error){
      console.error('Refused connection');
    }

  })).pipe( res );
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  if(err){
    err.status = 404;
    next(err);
  }
});

// error handlers

if (app.get('env') === 'development') {
  app.use(function(req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
