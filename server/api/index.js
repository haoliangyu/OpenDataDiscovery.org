var info = require('./info.js');

exports.attachHandlers = function(router) {

  /**
   * @api {get} /api/info/instance Get instance information
   * @apiName GetInstances
   * @apiGroup Info
   *
   * @apiSuccess {json} Response object
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
   * @api {get} /api/info/region_levels Get region levels
   * @apiName GetRegionLevels
   * @apiGroup Info
   *
   * @apiSuccess {json} Response object
   * @apiSuccessExample
   * 	{
   * 		"success": true,
   * 		"instances": [
   *   		{ "level": 0, "name": "continent" },
   *   		{ "level": 1, "name": "nation" }
   * 		]
   * 	}
   */

  router.get('/api/region_levels', info.getRegionLevels);

};
