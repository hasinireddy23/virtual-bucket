var express = require('express')
const port = 3000
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");

var welcomeHandler = require("./lib/welcome");
var uploadHandler = require("./lib/upload");
var deleteHandler = require("./lib/delete");
var downloadHandler= require("./lib/download");
var listHandler = require("./lib/list");

var app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/welcome", welcomeHandler);
app.use("/upload",uploadHandler);
app.use("/delete",deleteHandler);
app.use("/download",downloadHandler);
app.use("/list",listHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (res.headersSent) {
    return;
  }
  // Default error handler needs to be called only if headers were not already sent.
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500).json({
    message: err.message || "Unknown error",
  });
  next()
});
module.exports = app;

app.listen(port, () => {
  console.log(`Virtual Bucket app listening at http://localhost:${port}`)
})