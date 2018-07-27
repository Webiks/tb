const mongoose = require('mongoose');
const assert = require('assert');
const { WorldSchema } = require('../schemas/WorldSchema');
const { WorldLayerSchema } = require('../schemas/WorldLayersSchema');

require('../../config/serverConfig')();
const configUrl = configBaseUrl().configUrl;

// Database Name
const dbName = 'mytestproject';

// Connection URL
const url = `${configUrl.mongoBaseUrl}/${dbName}`;

// Use connect method to connect to the server
mongoose.connect(url);
console.log("connect to: " + url);
const db = mongoose.connection;

let worldModel;
let layerModel;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected successfully to server");

    // Define the MODELS of the world and the layers
    worldModel = db.model('World', WorldSchema);
    layerModel = db.model('WorldLayer', WorldLayerSchema);

    console.log("world model: " + worldModel);

    const layer = {
        worldName: 'db1',
        worldLayerId: 'db1: new_layer',
        name: 'new_layer',
        layer: { type: 'vector' }
    };

    const layer1 = {
        worldName: 'db1',
        worldLayerId: 'db1: layer1',
        name: 'layer1',
        layer: { type: 'raster' }
    };

    const world = {
        name: 'db1',
        country: 'Israel',
        disc: 'test',
        directory: 'local',
        layers: [layer, layer1]
    };

    const world1 = {
        name: 'new_world_1',
        country: 'Israel',
        layers: []
    };

    const worldList = [world, world1];
    const layerList = [layer, layer1];

    createNewWorld(world);
    // createNewWorld(world1);
    // deleteWorldByName(world1.name);
    // addWorldList(worldList);
    // createNewLayer(layer1);
    // addLayerList(layerList);
    // deleteLayerByID(layer1);

    // db.close();

    //     findDocuments(db, function() {
    //         indexCollection(db, function() {
    //             updateDocument(db, function () {
    //                 removeDocument(db, function () {
    //                     db.close();
    //                 });
    //             });
    //         });
    //     });

});

// =============
//  C R E A T E
// =============
// CREATE a new world
const createNewWorld = function(obj){
    const worldCollection = new worldModel(obj);
    console.log('CREATE new World: ' + worldCollection.name);

    worldCollection.save(function (err) {
        if (err) return handleError(err);
        console.log('Success to CREATE a new World: ' + worldCollection.name);
    });
};

// ADD a new LIST of worlds
const addWorldList = function(list){
    worldModel.insertMany(list, function (err) {
        if (err) return handleError(err);
        console.log('Success to ADD a new LIST of ' + list.length + ' worlds');
    });
};

// CREATE a new layer
const createNewLayer = function(obj){
    const layerCollection = new layerModel(obj);
    console.log('CREATE new Layer: ' + layerCollection.name);

    layerCollection.save(function (err) {
        if (err) return handleError(err);
        console.log('Success to CREATE a new Layer: ' + layerCollection.name);
    });
};

// ADD a new LIST of layers
const addLayerList = function(list){
    layerModel.insertMany(list, function (err) {
        if (err) return handleError(err);
        console.log('Success to ADD a new LIST of ' + list.length + ' layers');
    });
};

// =============
//  D E L E T E
// =============
// DELETE a world by its name
const deleteWorldByName = function(worldName){
    worldModel.deleteOne({ name: worldName }, function (err) {
        if (err) return handleError(err);
        console.log('Success to DELETE world: ' + worldName);
    });
};

// DELETE many worlds that match the giving filter (condition)
const deleteWorlds = function(filter){
    worldModel.deleteMany(filter, function (err) {
        if (err) return handleError(err);
        console.log('Success to DELETE worlds that match the condition: ' + filter);
    });
};

// DELETE a layer by its ID (from the worldlayer collection and from the world's layers array)
const deleteLayerByID = function(layer){
    const worldName = layer.worldName;
    const worldLayerId = layer.worldLayerId;
    // 1. DELETE from the worldlayer collection
    layerModel.deleteOne({ worldLayerId: worldLayerId }, function (err) {
        if (err) return handleError(err);
        console.log('Success to DELETE layer from the worldlayer collection: ' + worldLayerId);
    });
    // 2. DELETE from the world's layers array (UPDATE as an empty Layer)
    const query = {
        name: worldName,
        'layer.worldLayerId': worldLayerId
    };

    const selector = {
        layers: {
            $elemMatch: { worldLayerId: worldLayerId }
        }
    };

    const emptyLayers = {
        layers: [{}]
    };

    worldModel.findOneAndUpdate( query, {$unset : emptyLayers }, { projection: selector ,returnNewDocument: true }, function (err, result){
        if (err) return handleError(err);
        console.log("TEST result(after): " + result);
    });

    // worldModel.findOneAndUpdate( query, selector, emptyLayers, function (err, result){
    //     if (err) return handleError(err);
    //     console.log("TEST result(after): " + result);
    // });
    // worldModel.findOneAndUpdate( query, { layers: [ {} ]}, function (err, result){
    //         if (err) return handleError(err);
    //         console.log("TEST result(after): " + result);
    //         // worldModel.updateOne(result, { layers: [{}]}, function (err, res) {
    //         //     if (err) return handleError(err);
    //         //     console.log("SUCCEED to delete the layer inside the world! " + res.modifiedCount);
    //         // });
    // });

    // worldModel.findOneAndUpdate( ({ name: worldName }, { layers: { $elemMatch: { worldLayerId: worldLayerId } } }),
    //     { layers: [ {} ]}, function (err, result){
    //         if (err) return handleError(err);
    //         console.log("TEST result(after): " + result);
    // });
};

// DELETE all the world's layers
const deleteAllLayersWorld = function(worldName){
    layerModel.deleteMany({ worldName: worldName }, function (err) {
        if (err) return handleError(err);
        console.log('Success to DELETE all the ' +  worldName + ' layers');
    });
};

// DELETE many layers that match the giving filter (condition)
const deleteLayers = function(filter){
    layerModel.deleteMany(filter, function (err) {
        if (err) return handleError(err);
        console.log('Success to DELETE layers that match the condition: ' + filter);
    });
};


//==========================================================================================
// GET a new Model and Collection
const getCollectionByType = function(db, collectionType){
    let collection;
    let model;
    switch (collectionType){
        case 'world':{
            model = db.model('World', WorldSchema);
            collection = new model();
            break;
        }
        case 'layer':{
            model = db.model('WorldLayer', WorldLayerSchema);
            collection = new model();
            break;
        }
    }
    console.log('Success to get a new collection type: ' + collectionType);
    return {model, collection, collectionType};
};

// CREATE NEW collections
const addNewCollection = function(collection, obj, nameIndex){
    console.log('start add a new collection... ' + collection.collectionType);
    const model = collection.model;

    model.create(obj, function (err, instance) {
        console.log('start CREATE a new collection: ' + obj.name);
        if (err) return handleError(err);
        console.log('Success to add a new collection: ' + instance.name);
        return instance;
    });
};

// Handle ERRORS
const handleError = function (err) {
    console.error("Error! " + err);
    return 'err';
};

// const closeConnection = function (db) {
//     db.close();
// };


// // CREATE NEW collections
// const addNewCollection = function(db, collectionType, obj, callback){
//     // Get the Collection's Model and instance
//     let collection;
//     let model;
//     switch (collectionType){
//         case 'world':{
//             model = db.model('World', WorldSchema);
//             collection = new model(obj);
//             console.log("world collection: " + collection.name + ', ' + collection.country);
//             break;
//         }
//         case 'layer':{
//             model = db.model('WorldLayer', WorldLayerSchema);
//             collection = new model(obj);
//             console.log("layer collection: " + collection.worldName + ', ' + collection.name + ', ' + collection.layer.type);
//             break;
//         }
//     }
//     collection.save(function (err) {
//         if (!err) console.log('Success to add new collection!: ' + collection.name + ', ' + collectionType);
//     });
//
//     return {model, collection};
// };

// GET All or by Query
const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({'a': 3}).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs);
        callback(docs);
    });
};

// UPDATE
const updateDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a : 2 }
        , { $set: { b : 1 } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};

// DELETE (Remove)
const removeDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Delete document where a is 3
    collection.deleteOne({ a : 3 }, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document with the field a equal to 3");
        callback(result);
    });
};

// define INDEX to the collection fields
const indexCollection = function(db, callback) {
    db.collection('documents').createIndex(
        { "a": 1 },
        null,
        function(err, results) {
            console.log(results);
            callback();
        }
    );
};