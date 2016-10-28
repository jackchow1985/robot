var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);



var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
//session store
app.use(session({
    secret: 'FDT-HKSTP',
    resave: false,
    saveUninitialized: false,
    cookie  : { maxAge  : new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)) },
    // store: new MongoStore({      
    //   //url: 'mongodb://mongodb:7017/fdt',
    //   url: 'mongodb://52.193.46.156:27017/fdt',
    //   ttl: 60 * 24 * 60 * 60, // = 60 days. Default
    //   expires : 60 * 24 * 60 * 60
    // })
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// check login middleware
app.use(function(req, res, next) {
  // if(req.path == "/login.html" || req.path == "/kline.html"|| req.path == "/queryVol" || req.path.indexOf("styles/") >= 0 || req.path.indexOf(".png") >= 0 || req.path.indexOf("fonts/") >= 0 || req.path == "/auth" || req.path == "/arenaAuth"|| req.path == "/public.html") {
  //     if(req.session.userInfo && req.path == "/login.html") {
  //         res.redirect("/");
  //     } else {
  //         next();
  //     }
  // } else if (req.session.userInfo || req.query["key"] == "g!V6C68bb?V7akpC") { 
  //   if(req.session.userInfo && req.session.userInfo.core) { // user login
  //     if(req.method.toLowerCase() == "get" && req.path != "/getSession" && req.path.indexOf("get") >= 0 && req.session.userInfo.username && req.query["userID"] != req.session.userInfo.username) {
  //       res.json("invalid user id")
  //     } else {
  //       next()        
  //     }
  //   } else {     
  //     next();
  //   }
  // } else {
  //     res.redirect("/login.html");
  // }
  if(req.path == "/")
    res.redirect("/ra/index");
  next()
});

app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
