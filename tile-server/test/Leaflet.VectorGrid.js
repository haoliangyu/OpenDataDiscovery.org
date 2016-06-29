

L.SVG.Tile = L.SVG.extend({

	initialize: function (tileSize, options) {
		L.SVG.prototype.initialize.call(this, options);
		this._size = tileSize;

		this._initContainer();
		this._container.setAttribute('width', this._size.x);
		this._container.setAttribute('height', this._size.y);
		this._container.setAttribute('viewBox', [0, 0, this._size.x, this._size.y].join(' '));
	},

	getContainer: function() {
		return this._container;
	},

// 	onAdd: function() {},
	onAdd: L.Util.FalseFn,

	_initContainer: function() {
		L.SVG.prototype._initContainer.call(this);
		var rect =  L.SVG.create('rect');

// 		rect.setAttribute('x', 0);
// 		rect.setAttribute('y', 0);
// 		rect.setAttribute('width', this._size.x);
// 		rect.setAttribute('height', this._size.y);
// 		rect.setAttribute('fill', 'transparent');
// 		rect.setAttribute('stroke', 'black');
// 		rect.setAttribute('stroke-width', 2);
// 		this._rootGroup.appendChild(rect);
	},

	/// TODO: Modify _initPath to include an extra parameter, a group name
	/// to order symbolizers by z-index
	_initPath: function(layer) {
		L.SVG.prototype._initPath.call(this, layer);

		var path = layer._path;

    function addEventListener(name, handler) {
      path.addEventListener(name, function(e) {
        handler({
          type: name,
          target: layer,
          latlng: layer._map.mouseEventToLatLng(e)
        });
      });
    }

		if (typeof layer._onClick === 'function') {
			if (layer.type === 2) {
				path.setAttribute('pointer-events', 'stroke');
			} else if (layer.type === 3) {
				path.setAttribute('pointer-events', 'fill');
			} else if (layer.type === 1) {
        path.setAttribute('pointer-events', 'painted');
      }

      addEventListener('click', layer._onClick);
		}

    if (typeof layer._onMouseUp == 'function') {
      addEventListener('mouseup', layer._onMouseUp);
    }

    if (typeof layer._onMouseDown == 'function') {
      addEventListener('mousedown', layer._onMouseDown);
    }

    if (typeof layer._onMouseMove == 'function') {
      addEventListener('mousemove', layer._onMouseMove);
    }

    if (typeof layer._onMouseOver == 'function') {
      addEventListener('mouseover', layer._onMouseOver);
    }

    if (typeof layer._onMouseOut == 'function') {
      addEventListener('mouseout', layer._onMouseOut);
    }
	},

	_addPath: function (layer) {
		this._rootGroup.appendChild(layer._path);
	},

});

L.svg.tile = function(tileSize, opts){
	return new L.SVG.Tile(tileSize, opts);
}





L.Canvas.Tile = L.Canvas.extend({

	initialize: function (tileSize, options) {
		L.Canvas.prototype.initialize.call(this, options);
		this._size = tileSize;

		this._initContainer();
		this._container.setAttribute('width', this._size.x);
		this._container.setAttribute('height', this._size.y);
		this._layers = {};
		this._drawnLayers = {};
	},

	getContainer: function() {
		return this._container;
	},

	onAdd: L.Util.FalseFn,

	_initContainer: function () {
		var container = this._container = document.createElement('canvas');

// 		L.DomEvent
// 			.on(container, 'mousemove', L.Util.throttle(this._onMouseMove, 32, this), this)
// 			.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this)
// 			.on(container, 'mouseout', this._handleMouseOut, this);

		this._ctx = container.getContext('2d');
	},

	/// TODO: Modify _initPath to include an extra parameter, a group name
	/// to order symbolizers by z-index
	_initPath: function(layer) {
		L.Canvas.prototype._initPath.call(this, layer);

		var path = layer._path;

		if (typeof layer.onClick === 'function') {
			if (layer.type === 2) {
				path.setAttribute('pointer-events', 'stroke');
			} else if (layer.type === 3) {
				path.setAttribute('pointer-events', 'fill');
			} else if (layer.type === 1) {
        path.setAttribute('pointer-events', 'painted');
      }

			path.addEventListener('click', function(e) {
				layer.onClick({ type: 'click', target: layer });
			});
		}
	},
});

L.canvas.tile = function(tileSize, opts){
	return new L.Canvas.Tile(tileSize, opts);
}



L.VectorGrid = L.GridLayer.extend({

	options: {
		rendererFactory: L.svg.tile,
		vectorTileLayerStyles: {}
	},

	createTile: function(coords, done) {
		var renderer = this.options.rendererFactory(this.getTileSize(), this.options);

		var vectorTilePromise = this._getVectorTilePromise(coords);

		vectorTilePromise.then( function renderTile(vectorTile) {

			for (var layerName in vectorTile.layers) {
        console.log(layerName)
				var layer = vectorTile.layers[layerName];

				/// NOTE: THIS ASSUMES SQUARE TILES!!!!!1!
				var pxPerExtent = this.getTileSize().x / layer.extent;

				var layerStyle = this.options.vectorTileLayerStyles[ layerName ] ||
				L.Path.prototype.options;

        var onClick = getEventHandler(layerName, this.options.onClick);
        var onMouseDown = getEventHandler(layerName, this.options.onMouseDown);
        var onMouseUp = getEventHandler(layerName, this.options.onMouseUp);
        var onMouseOver = getEventHandler(layerName, this.options.onMouseOver);
        var onMouseMove = getEventHandler(layerName, this.options.onMouseMove);
        var onMouseOut = getEventHandler(layerName, this.options.onMouseOut);

				for (var i in layer.features) {
					var feat = layer.features[i];

					if (feat.type > 1) { // Lines, polygons

						this._mkFeatureParts(feat, pxPerExtent);

						/// Style can be a callback that is passed the feature's
						/// properties and tile zoom level...
						var styleOptions = (layerStyle instanceof Function) ?
						layerStyle(feat.properties, coords.z) :
						layerStyle;

						if (!(styleOptions instanceof Array)) {
							styleOptions = [styleOptions];
						}

            feat._map = this._map;
						feat.getLayerName = function() { return layerName; };
						feat.getCoords = function() { return coords; };

            feat._onClick = onClick;
            feat._onMouseMove = onMouseMove;
            feat._onMouseDown = onMouseDown;
            feat._onMouseUp = onMouseUp;
            feat._onMouseOver = onMouseOver;
            feat._onMouseOut = onMouseOut;

						/// Style can be an array of styles, for styling a feature
						/// more than once...
						for (var j in styleOptions) {
							var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);

							if (feat.type === 1) { // Points
								style.fill = false;
							} else if (feat.type === 2) {	// Polyline
								style.fill = false;
							}

							feat.options = style;
							renderer._initPath( feat );
							renderer._updateStyle( feat );

							if (feat.type === 1) { // Points
								// 							style.fill = false;
							} else if (feat.type === 2) {	// Polyline
								style.fill = false;
								renderer._updatePoly(feat, false);
							} else if (feat.type === 3) {	// Polygon
								renderer._updatePoly(feat, true);
							}

							renderer._addPath( feat );
						}

					} else {
						// Feat is a point (type === 1)

						/// FIXME!!!
					}
				}

			}
			L.Util.requestAnimFrame(done);
		}.bind(this));

		return renderer.getContainer();
	},

	// Fills up feat._parts based on the geometry and pxPerExtent,
	// pretty much as L.Polyline._projectLatLngs and L.Polyline._clipPoints
	// would do but simplified as the vectors are already simplified/clipped.
	_mkFeatureParts: function(feat, pxPerExtent) {

		var rings = feat.geometry;

		feat._parts = [];
		for (var i in rings) {
			var ring = rings[i];
			var part = [];
			for (var j in ring) {
				var coord = ring[j];
				if ('x' in coord) {
					// Protobuf vector tiles return {x: , y:}
					part.push(L.point(coord.x * pxPerExtent, coord.y * pxPerExtent));
				} else {
					// Geojson-vt returns [,]
					part.push(L.point(coord[0] * pxPerExtent, coord[1] * pxPerExtent));
				}
			}
			feat._parts.push(part);
		}

	},

});

L.vectorGrid = function (options) {
	return new L.VectorGrid(options);
};

function getEventHandler(layerName, handler) {
  if (typeof handler === 'function') {
    return handler;
  } else if (typeof handler === 'object') {
    if (typeof handler[layerName] === 'function') {
      return handler[layerName];
    }
  }
}






// geojson-vt powered!
// NOTE: Assumes the global `geojsonvt` exists!!!
L.VectorGrid.Slicer = L.VectorGrid.extend({

	options: {
		vectorTileLayerName: 'sliced',
		extent: 4096,	// Default for geojson-vt
		maxZoom: 14  	// Default for geojson-vt
	},

	initialize: function(geojson, options) {
		L.VectorGrid.prototype.initialize.call(this, options);


		this._slicers = {};
		if (geojson.type && geojson.type === 'Topology') {
			// geojson is really a topojson
			for (var layerName in geojson.objects) {
				this._slicers[layerName] = geojsonvt(
					topojson.feature(geojson, geojson.objects[layerName])
				, this.options);
// 				console.log('topojson layer:', layerName);
			}
		} else {
			// For a geojson, create just one vectortilelayer named with the value
			// of the option.
			// Inherits available options from geojson-vt!
			this._slicers[this.options.vectorTileLayerName] = geojsonvt(geojson, this.options);
		}

	},

	_getVectorTilePromise: function(coords) {

		var tileLayers = {};

		for (var layerName in this._slicers) {
			var slicer = this._slicers[layerName];
			var slicedTileLayer = slicer.getTile(coords.z, coords.x, coords.y);

// 			console.log(coords, slicedTileLayer && slicedTileLayer.features && slicedTileLayer.features.length || 0);

			if (slicedTileLayer) {
				var vectorTileLayer = {
					features: [],
					extent: this.options.extent,
					name: this.options.vectorTileLayerName,
					length: slicedTileLayer.features.length
				}

				for (var i in slicedTileLayer.features) {
					var feat = {
						geometry: slicedTileLayer.features[i].geometry,
						properties: slicedTileLayer.features[i].tags,
						type: slicedTileLayer.features[i].type	// 1 = point, 2 = line, 3 = polygon
					}
					vectorTileLayer.features.push(feat);
				}

				tileLayers[layerName] = vectorTileLayer;
			}

		}

		return new Promise(function(resolve){ return resolve({ layers: tileLayers })});
	},

});


L.vectorGrid.slicer = function (geojson, options) {
	return new L.VectorGrid.Slicer(geojson, options);
};





// Network & Protobuf powered!
// NOTE: Assumes the globals `VectorTile` and `Pbf` exist!!!
L.VectorGrid.Protobuf = L.VectorGrid.extend({

	options: {
		subdomains: 'abc',	// Like L.TileLayer
	},


	initialize: function(url, options) {
		// Inherits options from geojson-vt!
// 		this._slicer = geojsonvt(geojson, options);
		this._url = url;
    this._merc = new SphericalMercator({ size: 256 });
		L.VectorGrid.prototype.initialize.call(this, options);
	},


	_getSubdomain: L.TileLayer.prototype._getSubdomain,


	_getVectorTilePromise: function(coords) {

    var promise;

    if (this.options.bbox) {
      var bboxCoords = this._merc.bbox(coords.x, coords.y, coords.z);
      var tileBbox = L.latLngBounds(L.latLng(bboxCoords[1], bboxCoords[0]), L.latLng(bboxCoords[3], bboxCoords[2]));

      if (!this.options.bbox.overlaps(tileBbox)) {
        promise = Promise.resolve({ layers:[] });
      }
    }

    if (!promise) {
      var tileUrl = L.Util.template(this._url, L.extend({
  			s: this._getSubdomain(coords),
  			x: coords.x,
  			y: coords.y,
  			z: coords.z
  // 			z: this._getZoomForUrl()	/// TODO: Maybe replicate TileLayer's maxNativeZoom
  		}, this.options));

      promise = fetch(tileUrl).then(function(response){

  			if (!response.ok) {
  				return {layers:[]};
  			}

  			return response.blob().then( function (blob) {
  // 				console.log(blob);

  				var reader = new FileReader();
  				return new Promise(function(resolve){
  					reader.addEventListener("loadend", function() {
  						// reader.result contains the contents of blob as a typed array

  						// blob.type === 'application/x-protobuf'
  						var pbf = new Pbf( reader.result );
  // 						console.log(pbf);
  						return resolve(new vectorTile.VectorTile( pbf ));

  					});
  					reader.readAsArrayBuffer(blob);
  				});
  			});
  		});
    }

		return promise.then(function(json){

// 			console.log('Vector tile:', json.layers);
// 			console.log('Vector tile water:', json.layers.water);	// Instance of VectorTileLayer

			// Normalize feature getters into actual instanced features
			for (var layerName in json.layers) {
				var feats = [];

				for (var i=0; i<json.layers[layerName].length; i++) {
					var feat = json.layers[layerName].feature(i);
					feat.geometry = feat.loadGeometry();
					feats.push(feat);
				}

				json.layers[layerName].features = feats;
			}

			return json;
		});
	}
});

L.vectorGrid.protobuf = function (url, options) {
	return new L.VectorGrid.Protobuf(url, options);
};
//# sourceMappingURL=Leaflet.VectorGrid.js.map
