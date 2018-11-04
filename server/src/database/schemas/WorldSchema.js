const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create the World Schema
const WorldSchema = new Schema({
	_id: { type: String },         									  // the original world name (workspace name)
	name: { type: String, unique: true },             // from the DataBase - the user's name
	password: { type: String, unique: true },         // the user's (world) password
	desc: String,
	country: String,
	layersId: [String]                                // list of the Layers's Id from the DataBase Layers list
});

// create the world MODEL
const worldModel = mongoose.model('World', WorldSchema);

module.exports = worldModel;
