const mongoose = require('mongoose');

require('../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

// create CONNECTION with the mongo's database
// mongodb://user:pass@localhost:port/database
mongoose.connect(`${configUrl.mongoBaseUrl}/${configParams.databaseName}`);

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
    // ======================
    //     S C H E M A S
    // ======================
    // create a SCHEMA object
    const Schema = mongoose.Schema;
    // const ObjectId = Schema.Types.ObjectId;

    // create the App Schemas
    const WorldSchema = new Schema({
        name: { type: String, unique : true },          // from GeoServer - Workspace page
        desc: String ,                                  // from the user input
        country: String ,                               // from the user input
        directory: String ,                             // from the user input
        layers: [WorldLayerSchema]                      // from GeoServer - Layers page: the layers' list of the world
    });

    // WORLD LAYER: from GeoServer - world's Layers page
    const WorldLayerSchema = new Schema({
        worldName: String ,                             // one to many (many layers to one world)
        worldLayerId: { type: String , unique : true},  // worldname: layername
        name: String ,
        href: String ,                                  // href to the Layer page
        // LAYER: from GeoServer - Layer page
        layer: {
            name: String ,
            type: { type: String , uppercase: true , enum: ["RASTER", "VECTOR"]} ,
            defaultStyle: {
                name: String ,
                href: String                                // href to the style page
            },
            resource: {
                class: String ,                             // @class field
                name: String ,                              // the worldLayer Id ( worldname: layername )
                href: String                                // href to the details (RASTER/VECTOR) page
            },
            attribution: {
                logoWidth: Number,
                logoHeight: Number
            } ,
            storeId: String ,                               // get from the details page (RASTER/VECTOR) store's name field
            storeName: String ,                             // get from the store's name field
            filePath: String ,                              // get from the store's url field
            fileName: String ,                              // get from the store's url field
            fileExtension: String                           // get from the store's url field
        },
        // STORE: from GeoServer - Store page (coveragestores(RASTER) / datastores(VECTOR))
        store: {
            storeId: String ,                               // get from the details page (RASTER/VECTOR) store's name field
            name: String ,
            type: { type: String , uppercase: true , enum: ["RASTER", "VECTOR"]} ,      // get from the Layer page's type
            format: { type: String , uppercase: true , enum: ["GEOTIFF", "SHAPEFILE"]}, // get from the store type ('GeoTiff' or 'Shapefile')
            enable: Boolean ,
            _default: Boolean ,
            workspace: {
                name: String ,                              // the name of the world
                href: String                                // href to the workspace page
            },
            connectionParameters: {
                entry: [                                    // RASTER: 1 entery , VECTORS: 2 entries
                    {
                        type: Map ,                             // @key field: [0] 'namespace', [1] 'url'
                        of: String                              // $ field: the value of the key
                    }
                ]
            },
            url: String ,                                   // RASTER only
            href: String                                    // get from the "coverages"  in RASTERS or "featureTypes" in VECTORS
        },
        // LAYER DETAILS: from GeoServer - RASTER (coverage object) / VECTOR (featureType object) page
        data: {
            worldLayerId: { type: String, primaryKey: true },
            name: String ,
            nativeName: String ,
            namespace: {
                name: String ,
                href: String                                // href to the namespace page
            },
            title: String ,
            keywords: {
                string: [String]
            },
            nativeCRS: {
                type: Map,                                  // @class field (key)
                of: String                                  // $ field (value)
            },
            srs: String ,
            nativeBoundingBox: {
                minx: Number ,
                maxx: Number ,
                miny: Number ,
                maxy: Number ,
                crs: {
                    type: Map,                               // @class field (key)
                    of: String                               // $ field (value)
                }
            },
            latLonBoundingBox: {
                minx: Number ,
                maxx: Number ,
                miny: Number ,
                maxy: Number ,
                crs: String
            },
            projectionPolicy: String ,
            enable: Boolean ,
            metadata: {
                entry: {
                    type: Map ,                             // @key field
                    of: String                              // $ field: the value of the key
                }
            },
            store: {
                class: String,                              // @class field ('coverage' or 'datastore')
                name: String,                               // the store id ( worldname: storename )
                href: String                                // href to the store page
            },
            // VECTORS only
            maxFeatures: Number ,
            numDecimals: Number ,
            overridingServiceSRS: Boolean ,
            skipNumberMatched: Boolean ,
            circularArcPresent: Boolean ,
            attributes: {
                attribute : [
                    {
                        name: String ,
                        minOccurs: Number ,
                        maxOccurs: Number ,
                        nillable: Boolean,
                        binding: String
                    }
                ]
            },
            // RASTER only
            nativeFormat: String ,
            grid: {
                dimension: Number,                          // @dimension field
                range: {
                    low: String ,
                    high: String
                },
                transform:{
                    scaleX: Number ,
                    scaleY: Number ,
                    shearX: Number ,
                    shearY: Number ,
                    transletX: Number ,
                    transletY: Number
                },
                crs: String
            },
            supportedFormats: {
                string: [String]
            },
            interpolationMethods: {
                string: [String]
            },
            defaultInterpolationMethod: String ,
            dimension: {
                coverageDimension: [
                    {
                        name: String ,
                        description: String,
                        range: {
                            min: Number || String,
                            max: Number || String,
                        } ,
                        nullValues: {
                            double: [Number]
                        } ,
                        unit: String ,
                        dimensionType: {
                            name: String
                        }
                    }
                ]
            },
            requestSRS: {
                string: [String]
            },
            responseSRS: {
                string: [String]
            },
            parameters: {
                entry: [
                    {
                        string: [String]
                    }
                ]
            }
        },
        // IMAGE DATA: data from the image file
        imageDataId: {
            file: {
                name: String,
                type: String,                           // TIF or SHX
                folderPath: String,
                dateCreated: Date,
                dateModified: Date,
                size: Number,                           // MB or KB
                attribute: String
            },
            image: {
                width: Number,                          // pixels
                height: Number,                         // pixels
                horizontalResolution: Number,           // dpi
                verticalResolution: Number,             // dpi
                bitDepth: Number,
                compression: String
            },
            photo: {
                photometricInterpretation: String       // RGB
            }
        },
        // INPUT DATA: data from the user
        inputDataId: {
            affiliation: { type: String , uppercase: true , enum: ["INPUT", "OUTPUT", "UNKNOWN" ] },  // 'INPUT' or 'OUTPUT'
            GSD: Number ,
            flightAltitude: Number ,
            cloudCoveragePercentage: Number ,
            zoom: Number ,
            opacity: { type: Number, min: 0, max: 1 },
            sensor: {
                name: String ,
                maker: String ,
                bands: [String]
            }
        }
    });

    // ======================
    //     M O D E L S
    // ======================
    // create MODELS
    const WorldModel = mongoose.model('World', WorldSchema);
    const WorldLayerModel = mongoose.model('WorldLayer', WorldLayerSchema);


});

