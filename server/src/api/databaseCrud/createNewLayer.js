const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

const createNewLayer = (layer, worldId) => {
	console.log('createNewLayer: start to CREATE new Layer in the DataBase...', layer.name);
	// create the new layer in the Layers list and get the layer id (from mongoDB)
	return dbLayerCrud.add(layer)
		.then(newLayer => {
			// add the layer's Id to the the layersId List in the world
			console.log('createNewLayer: add the layer Id to the layersId list in the world...', newLayer._id);
			return dbWorldCrud.updateField({ _id: worldId }, { layersId: newLayer._id }, 'updateArray')
				.then(() => newLayer);
		});
};

module.exports = createNewLayer;
