var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var memberRouter = require('./routes/member');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var carRouter = require('./routes/car');
var orderRouter = require('./routes/order');
/********************** 
 首頁
 會員註冊/登入
 購物車
 會員專區
 查看訂單
********************** */

var app = express();

// view engine setup
var engine = require('ejs-locals');
var path = require('path');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/member', memberRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/car', carRouter);
app.use('/order', orderRouter);
/*********************** */

/*********************** */
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

module.exports = app;
