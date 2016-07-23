var express = require('express');
var logger = require('log4js').getLogger('server');
var fs = require('fs');
var http = require('http');
var path = require('path');
var sprintf = require('sprintf-js').sprintf;

var params = require('./config/params.js');

var app = express();

require('./api/index.js').attachHandlers(app);

app.use(express.static(path.resolve(__dirname, './../www/static/')))
    .all('/*', function(req, res) {
      res.status(200)
          .set({ 'content-type': 'text/html; charset=utf-8' })
          .sendFile(path.resolve(__dirname, '../www/static/index.html'));
    });

http.createServer(app)
    .listen(params.port.production, function() {
      logger.info(sprintf('Server is running at port %d...', params.port.production));
    })
    .on('request', function(req) {
      logger.info(sprintf('[%s] %s', req.method, req.url));
    });
