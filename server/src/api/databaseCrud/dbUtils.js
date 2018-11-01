const gsUtils = require('../geoserverCrud/gsUtils');
const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

// Handle ERRORS
const handleError = (res, status, consoleMessage, sendMessage) => {
	console.error('db Layer: ' + consoleMessage);
	res.status(status).send(sendMessage);
};

// remove the layer only if it doesn't exist in another world (from the DataBase and from Geosewrver)
const removeLayer = (layerId, worldId) => {
	// 1. get all the worlds except to the current world
	return dbWorldCrud.getAll().then(worlds => worlds.filter(world => world._id !== worldId))
		.then (worlds => {
			// 2. check if a giving layer exists in another world
			const isLayerExist = worlds.some(world => world.layersId.some(id => id === layerId));
			console.log('isLayerExist: ', isLayerExist);
			// 3. if doesn't exist - remove the layer
			if (!isLayerExist) {
				console.log('start to remove layer: ', layerId);
				// a. find the layer in the database
				dbLayerCrud.get({ _id: layerId })
					.then(layer => {
						console.log(`dbLayers removeLayer: a. got the layer: ${layer.name}`);
						// b. save the layer data before remove it from the database
						let removedLayerData;
						if (layer.fileType !== 'image') {
							removedLayerData = {
								worldId: worldId,
								resourceUrl: layer.layer.resource.href,
								storeUrl: layer.data.store.href,
								type: layer.fileType
							};
						} else {
							removedLayerData = {
								worldId: worldId,
								type: layer.fileType
							};
						}
						console.log(`removedLayerData: ${JSON.stringify(removedLayerData)}`);
						// c. remove the layer from the Layers list in the DataBase
						return dbLayerCrud.remove({ _id: layerId })
							.then(() => {
								console.log(`removeLayerById: ${layerId}`);
								return removedLayerData;
							})
							.then(removedLayerData => {
								if (removedLayerData.type !== 'image') {
									// d. if it isn't an image - delete the layer from GeoServer:
									console.log("dbLayers remove layer: d. start to delete layer from the GeoServer!");
									return gsUtils.removeLayerFromGeoserver(removedLayerData.resourceUrl, removedLayerData.storeUrl)
										.then(() => {
											console.log("dbLayers remove layer: e. deleted the store: ", removedLayerData.storeUrl);
											return 'succeed to remove the file!';
										})
								} else {
									console.log("succeed to remove an image file!");
									return 'succeed to remove an image file!';
								}
							})
					})
			} else {
				return `succeed to remove '${layerId} layer from '${worldId} world!`
			}
		});
};

module.exports = {
	handleError,
	removeLayer
};
