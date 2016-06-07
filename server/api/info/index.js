var info = require('./info.js');

exports.attachHandlers = function(router) {

  /**
 * @api {get} /info/instance Request instance information
 * @apiName GetInstances
 * @apiGroup Info
 *
 * @apiSuccess {Object} Response object
 * @apiSuccessExample
 * 	{
 * 		success: true,
 * 		instances: [
 * 			{
 * 				name: 'Data.gov',
 * 				layers: [
 * 					{ level: 'Nation', name: 'datagov_nation' url: tile_url },
 * 					...
 * 				]
 * 			},
 * 			...
 * 		]
 * 	}
 */
  router.get('/info/instance', info.getInstances);
};
