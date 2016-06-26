var info = require('./info.js');

exports.attachHandlers = function(router) {

  /**
 * @api {get} /api/info/instance Request instance information
 * @apiName GetInstances
 * @apiGroup Info
 *
 * @apiSuccess {Object} Response object
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
  router.get('/api/info/instance', info.getInstances);
};
