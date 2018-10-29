const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

const createNewLayer = (layer, worldId) => {
	console.log('db LAYER SERVER: start to CREATE new Layer in the DataBase...' + layer.name);
	// create the new layer in the Layers list and get the layer id (from mongoDB)
	return dbLayerCrud.add(layer)
		.then( newLayer => addLayerIdToWorld(worldId, newLayer))
		.catch(error => {
			console.error(`db LAYER: ERROR to CREATE New LAYER in DataBase!: ${error}`);
			throw new Error(`Failed to create ${layer.name} layer! - ${error}`);
		});
};

// ========================================= private  F U N C T I O N S ================================================

const findWorldById = (_id) => dbWorldCrud.get({ _id });

const updateWorldLayersId = (_id, layerId, operation) => dbWorldCrud.updateField({ _id }, { layersId: layerId }, operation);

// add the layer Id to the layersId list in the world
const addLayerIdToWorld = (worldId, newLayer) => {
	return findWorldById(worldId)
		.then( world => {
			console.log("dbLayers create layer: a. got the world: " + world.name);
			// update the layerId list (push the new layer's Id)
			return updateWorldLayersId(worldId, newLayer._id, 'updateArray')
				.then( updateWorld => {
					console.log("dbLayers create layer: b. update the world layersId: " + newLayer._id);
					return newLayer;
				})
				.catch(error => {
					console.error(`db LAYER: ERROR to update the World in DataBase!: ${error}`);
					throw new Error(`Failed to update ${worldId} layersId field! - ${error}`);
				})
		})
		.catch(error => {
			console.error(`db LAYER: ERROR to find the World in DataBase!: ${error}`);
			throw new Error(`Failed to find ${worldId} workspace! - ${error}`);
		})
};

module.exports = createNewLayer;
