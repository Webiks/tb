const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PointSchema = new Schema({
    point: [Number, Number]
});

const LineStringSchema = new Schema({
    lineString: [PointSchema]
});

const polygon = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
        required: true
    }
});

// create the World-Layer Schema
const LayerSchema = new Schema({
    workspaceName: String ,                         // the name of the GeoServer workspace
    worldLayerId: String ,                          // workspaceName: layername , unique : true
    name: String ,                                  // from GeoServer
    href: String ,                                  // href to the Layer page
    // for ANSYN: get the polygon from the latLonBoundingBox field in the data using the turf.bboxPolygon(bbox) function
    footprint: polygon,
    date: Date,
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
        connectionParameters: {                         // was translated from a map
            namespace: String,
            url: String                                 // VECTOR only
        },
        url: String ,                                   // RASTER only
        href: String                                    // get from the "coverages"  in RASTERS or "featureTypes" in VECTORS
    },
    // LAYER DETAILS: from GeoServer - RASTER (coverage object) / VECTOR (featureType object) page
    data: {
        name: String ,
        nativeName: String ,
        namespace: {
            name: String ,
            href: String                                 // href to the namespace page
        },
        title: String ,
        keywords: {
            string: [String]
        },
        nativeCRS: String,                              // was translated from a map
        srs: String ,
        nativeBoundingBox: {
            minx: Number ,
            maxx: Number ,
            miny: Number ,
            maxy: Number,
            crs: String                                 // was translated from a map
        },
        latLonBoundingBox: {
            minx: Number ,
            maxx: Number ,
            miny: Number ,
            maxy: Number ,
            crs: String
        },
        center: [Number, Number],
        projectionPolicy: String ,
        enable: Boolean ,
        metadata: {                                     // was translated from a map
            dirName: String ,                           // RASTERS
            recalculateBounds: String                   // VECTROS
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
    imageData: {
        file: {
            name: String,
            size: Number,                           // MB or KB
            dateCreated: { type: Date, default: Date.now },
            dateModified: { type: Date, default: Date.now },
            // type: String,                           // TIF or SHX
            // folderPath: String,
            // attribute: String
        }
        // image: {
        //     width: Number,                          // pixels
        //     height: Number,                         // pixels
        //     horizontalResolution: Number,           // dpi
        //     verticalResolution: Number,             // dpi
        //     bitDepth: Number,
        //     compression: String
        // },
        // photo: {
        //     photometricInterpretation: String       // RGB
        // }
    },
    // INPUT DATA: data from the user
    inputData: {
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

// create the layer MODEL
const layerModel = mongoose.model('Layer', LayerSchema);

module.exports = layerModel;