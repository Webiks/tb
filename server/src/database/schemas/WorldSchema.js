const mongoose = require ('mongoose');
const { WorldLayerSchema } = require ('./WorldLayersSchema');

const Schema = mongoose.Schema;

// create the World Schema
const WorldSchema = new Schema({
    name: { type: String , unique : true },         // from GeoServer - Workspace page , unique : true
    desc: String ,                                  // from the user input
    country: String ,                               // from the user input
    directory: String ,                             // from the user input
    layers: [WorldLayerSchema],                     // from GeoServer - Layers page: the layers' list of the world
    workspaceName: { type: String , unique : true }
});

// create the world MODEL
const worldModel = mongoose.model('World', WorldSchema);

module.exports = worldModel;
