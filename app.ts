import { NextFunction, Request, Response } from "express";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var deployRouter = require('./routes/deploy');
var deleteRouter = require('./routes/delete');
var updatePortRouter = require('./routes/update');
var redeployRouter = require('./routes/redeploy');
var loginRouter = require('./routes/login');
var dbConnect = require('./schemas');

interface Err extends Error {
  status: number
  data ?: any
}

var app = express();
dbConnect();
app.use(cors());
app.use(logger('dev'));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/deploy', deployRouter);
app.delete('/:namespace/repo/:repoName', deleteRouter);
app.patch('/:namespace/repo/:repoName', updatePortRouter);
app.post('/:namespace/repo/:repoName/redeploy', redeployRouter);
app.get('/login', loginRouter);
app.get('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req :Request, res : Response, next : NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err : Err, req :Request, res : Response, next : NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({'error' : err});
});

module.exports = app;
