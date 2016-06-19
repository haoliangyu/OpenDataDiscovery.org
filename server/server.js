var express = require('express');
var logger = require('log4js').getLogger('server');
var fs = require('fs');
var http = require('http');
var sprintf = require('sprintf-js').sprintf;
var request = require('request-promise');

var params = require('./config/params.js');
var vtParams = require('../tile-server/params.js');

var app = express();

fs.readdirSync(__dirname + '/api/').forEach(function (file) {
  if(file.substr(-3) !== '.js') {
    //run the attachHandlers function inside module export
    require(__dirname + '//api/' + file).attachHandlers(app);
  }
});

app.use(express.static(__dirname + '/../www/static/'))
    .all('/vt/:layer/:z/:x/:y.mvt', function(req, res) {
      var vtUrl = sprintf(params.vtUrlTemplate, vtParams.port, req.params.layer, +req.params.z, +req.params.x, +req.params.y);
      request.get(vtUrl).then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        logger.error(err);
        res.status(500).send({ success: false, message: 'Unable to retrieve vector tile' })
      });
    })
    .all('/*', function(req, res) {
      res.status(200)
          .set({ 'content-type': 'text/html; charset=utf-8' })
          .sendfile('../www/static/index.html' );
    });

http.createServer(app)
    .listen(params.port, function() {
      logger.info(sprintf('Server is running at port %d...', params.port));
    })
    .on('request', function(req, res) {
      logger.info(sprintf('[%s] %s', req.method, req.url));
    });
