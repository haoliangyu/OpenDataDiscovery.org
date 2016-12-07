var express = require('express');
var logger = require('log4js').getLogger('server');
var http = require('http');
var path = require('path');

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
      logger.info(`Server is running at port ${params.port.production}...`);
    })
    .on('request', function(req) {
      logger.info(`[${req.method}] ${req.url}`);
    });
