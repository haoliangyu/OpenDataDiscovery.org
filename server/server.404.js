var express = require('express');
var logger = require('log4js').getLogger('server');
var http = require('http');
var path = require('path');

var params = require('./config/params.js');

var app = express();

app.use(express.static(path.resolve(__dirname, './../www/static_src/')))
    .all('/*', function(req, res) {
      res.status(200)
          .set({ 'content-type': 'text/html; charset=utf-8' })
          .sendFile(path.resolve(__dirname, '../www/static_src/views/index.404.html'));
    });

http.createServer(app)
    .listen(params.port, function() {
      logger.info(`Server is running at port ${params.port}...`);
    })
    .on('request', function(req) {
      logger.info(`[${req.method}] ${req.url}`);
    });
