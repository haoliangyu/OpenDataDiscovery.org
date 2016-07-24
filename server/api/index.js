var bodyParser = require('body-parser');

var info = require('./info.js');
var map = require('./map.js');

exports.attachHandlers = function(router) {

  /**
   * @api {get} /api/instance Get instance information
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
   * @api {get} /api/region_levels Get region levels
   * @apiName GetRegionLevels
   *
   * @apiSuccessExample {json} Response
   * 	{
   * 		"success": true,
   * 		"instances": [
   *   		{ "level": 0, "name": "continent" },
   *   		{ "level": 1, "name": "nation" }
   * 		]
   * 	}
   */

  router.get('/api/region_levels', info.getRegionLevels);

  /**
   * @api {post} /api/map_styles Get map styles
   * @apiName GetMapStyles
   *
   * @apiParam {integer}    [class=5]     Number of data classes, range from 3 to 11. Default: 5
   * @apiParam {integer[]}  [instances]   A list of instance IDs to calculate. If not provided, all instances will be in the calculation.
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

  router.post('/api/map_styles', bodyParser.json(), map.getStyles);

};
