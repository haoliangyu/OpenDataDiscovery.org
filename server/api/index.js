var bodyParser = require('body-parser');

var info = require('./info.js');
var map = require('./map.js');

exports.attachHandlers = function(router) {

  /**
   * @api {get} /api/instances Get instance list
   * @apiName GetInstances
   *
   * @apiSuccessExample
   * 	{
   * 		"success": true,
   * 		"instances": [
   * 			{
   * 				"name": "Data.gov",
   * 				"bbox": {
   * 					"type": "Feature",
   * 					"coordinates": []
   * 				},
   * 				"layers": [
   * 					{ "level": "Nation", "name": "datagov_nation" "url": "tile_url" }
   * 				]
   * 			}
   * 		]
   * 	}
   */

  router.get('/api/instances', info.getInstances);

  /**
   * @api {get} /api/instances/summary Get instance summary
   * @apiName GetInstanceSummary
   *
   * @apiSuccessExample
   * 	{
   * 		"success": true,
   * 		"summary": {
   * 		   "count": 12
   * 		}
   * 	}
   */

  router.get('/api/instances/summary', info.getInstanceSummary);

  /**
   * @api {get} /api/instance/:id Get instance information
   * @apiName GetInstanceInfo
   *
   * @apiSuccessExample
   * 	{
   * 		"success": true,
   * 		"instance": [
   * 			{
   * 				"name": "Data.gov",
   * 				"count": 2000,
   * 				"description": "test",
   *     		"tags": [
   *     				{ "name": "earth", "updateDate": "2012-08-12", "count": 125 }
   *     		],
   * 				"categories": [
   * 						{ "name": "environment", "updateDate": "2011-08-21", "count": 422 }
   * 				],
   *     		"organizations": [
   *     				{ "name": "department", "updateDate": "2012-08-11", "count":500 }
   *     		],
   *     		"updateDate": "2012-06-17"
   * 			}
   * 		]
   * 	}
   */
  router.get('/api/instance/:instanceID', info.getInstanceInfo);

  /**
   * @api {post} /api/map_styles Get map styles
   * @apiName GetMapStyles
   *
   * @apiParam {integer}    [count=5]     Number of data classes, range from 3 to 11. Default: 5
   *
   * @apiSuccessExample {json} Response
   * 	{
   * 		"success": true,
   * 		"styles": [
   * 			{ "fill": "#ff0", "upperBound": -Infinit, "lowerBound": 1000 },
   * 			{ "fill": "#f0f", "lowerBound": 1000, "upperBound": 2000 },
   * 			{ "fill": "#0ff", "lowerBound": 2000, "upperBound": Infinit }
   * 		]
   * 	}
   */

  router.get('/api/map_styles/:count', bodyParser.json(), map.getStyles);

};
