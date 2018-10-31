const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

const createNewLayer = (layer, worldId) => {
	console.log('db LAYER SERVER: start to CREATE new Layer in the DataBase...' + layer.name);
	// create the new layer in the Layers list and get the layer id (from mongoDB)
	return dbLayerCrud.add(layer)
		.then(newLayer => {
			return addLayerIdToWorld(worldId, newLayer._id).then(() => newLayer);
		});
};

// ========================================= private  F U N C T I O N S ================================================
// add the layer Id to the layersId list in the world
const addLayerIdToWorld = (worldId, layerId) => {
	return dbWorldCrud.get(worldId)
		.then(world => dbWorldCrud.updateField(worldId, layerId, 'updateArray'));
};

module.exports = createNewLayer;
