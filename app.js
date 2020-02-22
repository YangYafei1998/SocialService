var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

//Database
var mongo = require('mongodb'); 
var monk = require('monk');
var db = monk('localhost:27017/local');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var socialServiceRouter = require('./routes/socialservice');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make our db accessible to routers 
app.use(function(req,res,next){
req.db = db; next();
});

app.use('/', socialServiceRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(3001, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log("assignment2 app listens at http://%s:%s", host, port);
})

