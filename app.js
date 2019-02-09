const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const searchRouter = require('./routes/search');
const limpaRouter = require('./routes/limpa');
const aboutRouter = require('./routes/aboutUs');
const productRouter = require('./routes/product');
const scrapeRouter = require('./routes/scrape');
const config = require("./config");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/otsi', searchRouter);
app.use('/tooted', productRouter);
app.use('/limpa', limpaRouter);
app.use('/meist', aboutRouter);

if (!config.production) {
  app.use('/scrape', scrapeRouter);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = (req.app.get('env') === 'development' && !config.production) ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
