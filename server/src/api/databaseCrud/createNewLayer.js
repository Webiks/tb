const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

const createNewLayer = (layer) => {
	console.log('db LAYER SERVER: start to CREATE new Layer in the DataBase...' + layer.name);
	// 1. create the new layer in the Layers list and get the layer id (from mongoDB)
	return dbLayerCrud.add(layer)
		.then( newLayer => {
			// 2. add the layer Id to the layersId list in the world
			return findWorldByWorkspaceName(layer.workspaceName)
				.then(world => {
					if (!world) {
						throw new Error('No Workspace!');
					}
					return world;
				})
				.then( world => {
					console.log("dbLayers create layer: a. got the world: " + world.name);
					// update the layerId list (push the new layer's Id)
					return updateWorldLayersId(world._id, newLayer._id, 'updateArray')
						.then( updateWorld => {
							console.log("dbLayers create layer: b. update the world layersId: " + newLayer.id);
							return newLayer;
						})
						.catch(error => {
							console.error(`db LAYER: ERROR to update the World in DataBase!: ${error}`);
							throw new Error(`Failed to update ${layer.workspaceName} layersId field! - ${error}`);
						})
				})
				.catch(error => {
					console.error(`db LAYER: ERROR to find the World in DataBase!: ${error}`);
					throw new Error(`Failed to find ${layer.workspaceName} workspace! - ${error}`);
				})
		})
		.catch(error => {
			console.error(`db LAYER: ERROR to CREATE New LAYER in DataBase!: ${error}`);
			throw new Error(`Failed to create ${layer.name} layer! - ${error}`);
		});
};

// ========================================= private  F U N C T I O N S ================================================

const findWorldByWorkspaceName = (workspaceName) => dbWorldCrud.get({ workspaceName });

const updateWorldLayersId = (_id, layerId, operation) => dbWorldCrud.updateField({ _id }, { layersId: layerId }, operation);

module.exports = createNewLayer;
