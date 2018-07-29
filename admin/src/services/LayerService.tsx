import axios from 'axios';
import { GeoTIFF } from 'geotiff';
import config from "../config/config";
import { IWorldLayer } from "../interfaces/IWorldLayer";
import { ILayer } from '../interfaces/ILayer';

export class LayerService {

    static baseUrl: string = `${config.baseUrl.path}/${config.baseUrl.api}/dbLayers`;
    static baseGeoUrl: string = `${config.baseUrl.path}/${config.baseUrl.api}/gsLayers`;

    // ========================
    //  MONGO DATABASE METHODS
    // ========================
    // ==============
    //  GET Requests
    // ==============
    // get all World's Layers list from the Database
    static getAllWorldLayers(worldName: string): Promise<any> {
        console.log("start the GET All WORLD'S LAYERS service..." + worldName);
        return axios
            .get(`${this.baseUrl}/${worldName}`)
            .then(layers => layers.data)
            .catch(error => {
                console.error("getAllWorldLayers ERROR!" + error);
                throw new Error(error);
            });
    }

    // get one World's Layer from the Database
    static getWorldLayer(worldLayerId: string): Promise<any> {
        console.log("start the GET LAYER INFO service..." + `${this.baseUrl}/${worldLayerId}`);
        return axios
            .get(`${this.baseUrl}/${worldLayerId}`)
            .then(layers => layers.data)
            .catch(error => {
                console.error("getWorldLayer ERROR!" + error);
                throw new Error(error);
            });
    }

    // ==========================
    //  CREATE a new World-Layer
    // ==========================
    static createWorldLayer(newLayer: IWorldLayer): Promise<any> {
        console.log("start the CREATE WORLD-LAYER service..." + `${this.baseUrl}/${newLayer.worldLayerId}`);
        return axios
            .post(`${this.baseUrl}/${newLayer.worldLayerId}`, newLayer)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to create new World-Layer: " + newLayer.name);
                return res.data;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to create new World-Layer: " + error));
    }

    // ==============
    // DELETE Request
    // ==============



    // ===================
    //  GEOSERVER METHODS
    // ===================
    // ==============
    //  GET Requests
    // ==============
    // get all layers of the world (including the ILayer's fields)
    static getAllLayersData(worldName: string): Promise<any> {
        console.warn("start the getAllLayersData service...");
        // A. get an Array of all the world's layers (IWorldLayer: name + href)
        return this.getWorldLayers(worldName)
        // B. get all the data of each layer:
            .then(layersList => this.getLayersDataByList(worldName, layersList))
            .catch(error => {
                console.error("getAllLayersData ERROR!" + error.message);
                throw new Error(error);
            });
    }

    // A. get an Array of all the world's layers (IWorldLayer: name + href)
    static getWorldLayers(worldName: string): Promise<any> {
        console.log("start the GET LAYERS service..." + worldName);
        return axios
            .get(`${this.baseGeoUrl}/${worldName}`)
            .then(layers => layers.data.layers.layer)
            .catch(error => {
                console.error("getLayers ERROR!" + error.message);
                throw new Error(error);
            });
    }

    // B. get the data of each layer in the world
    static getLayersDataByList(worldName: string, list: IWorldLayer[]): Promise<any> {
        // C. get the data of each layer in the world
        const promises = list.map((worldLayer: IWorldLayer) => this.getLayerByName(worldName, worldLayer));
        return Promise.all(promises);
    }

    // C. get all layer's Data by name
    static getLayerByName (worldName: string, worldLayer: IWorldLayer): Promise<any> {
        console.warn("start the GET LAYERS service..." + worldLayer.name);
        const layer = worldLayer;
        layer.worldName = worldName;                                      // set the world name
        console.log("0. getLayerByName worldLayer: " + JSON.stringify(layer));
        // 1. get the layer type & resource info
        return this.getLayerInfo(worldName, layer)
        // 2. get the layer's details data according to the layer's type
            .then( layerInfo =>  {
                console.log("1. getLayerByName layerInfo: " + JSON.stringify(layerInfo));
                return this.getLayerDetails(worldName, layerInfo)
            })
            // 3. get the layer's store data according to the layer's type
            .then( layerData => {
                console.log("2. getLayerByName layerData: " + JSON.stringify(layerData));
                return this.getStoreData(worldName, layerData)
            })
            // 4. get the image data from the file using the Geotiff
            // .then( layer => {
            //     console.warn("service: File Path: " + layer.layer.filePath);
            //     // this.getImageData(layer.layer.filePath)
            //     this.getImageData(`file://C:/dev/Terrabiks/geoserver/rasters/SugarCane.tif`);
            // })
            .catch(error => {
                console.error("getLayer ERROR!" + error.message);
                throw new Error(error)
            });
    };

    // 1. get the layer type & resource info
    static getLayerInfo(worldName: string, worldLayer: IWorldLayer): Promise<any> {
        console.log("start the GET LAYER INFO service..." + `${this.baseGeoUrl}/layer/${worldName}/${worldLayer.name}`);
        return axios
            .get(`${this.baseGeoUrl}/layer/${worldName}/${worldLayer.name}`)
            .then(layerInfo => {
                const layer = {...worldLayer, ...(layerInfo.data)};
                layer.worldLayerId = layer.layer.resource.name;                        // set the layer id
                layer.layer.type = layer.layer.type.toUpperCase();                     // set the layer type
                return {...layer};
            })
            .catch(error => {
                console.error("getLayerInfo ERROR!" + error);
                throw new Error(error)
            });
    }

    // 2. get layer's details ("data" field - type IRaster or IVector)
    static getLayerDetails(worldName: string, layer: IWorldLayer): Promise<any> {
        console.warn("start the GET LAYER DETAILS service..." + layer.name + ', ' + layer.layer.type);
        return axios
            .get(`${this.baseGeoUrl}/details/${worldName}/${layer.name}`)
            .then(layerDetails => {
                // get the layer details data according to the layer's type
                switch (layer.layer.type) {
                    case ('RASTER'):
                        layer.data = layerDetails.data.coverage;
                        layer.layer.storeId = layerDetails.data.coverage.store.name;            // set the store id
                        layer.data.nativeCRS =                                                  // translate the map to an object
                            layerDetails.data.coverage.nativeCRS.$ ? layerDetails.data.coverage.nativeCRS.$ : layerDetails.data.coverage.nativeCRS ;
                        layer.data.nativeBoundingBox.crs =                                     // translate the map to an object
                            layerDetails.data.coverage.nativeBoundingBox.crs.$
                                ? layerDetails.data.coverage.nativeBoundingBox.crs.$
                                : layerDetails.data.coverage.nativeBoundingBox.crs ;
                        layer.data.metadata.dirName = layerDetails.data.coverage.metadata.entry.$;       // translate the map to an object
                        layer.data.center =                                                     // set the data center point
                            [layerDetails.data.coverage.latLonBoundingBox.minx, layerDetails.data.coverage.latLonBoundingBox.maxy];
                        break;
                    case ('VECTOR'):
                        layer.data = layerDetails.data.featureType;
                        console.log("getLayerDetails: layer data: " + JSON.stringify(layer.data));
                        layer.layer.storeId = layerDetails.data.featureType.store.name;         // set the store id
                        layer.data.nativeCRS =                                                  // translate the map to an object
                            layerDetails.data.featureType.nativeCRS.$ ? layerDetails.data.featureType.nativeCRS.$ : layerDetails.data.featureType.nativeCRS ;
                        layer.data.nativeBoundingBox.crs =                                     // translate the map to an object
                            layerDetails.data.featureType.nativeBoundingBox.crs.$
                                ? layerDetails.data.featureType.nativeBoundingBox.crs.$
                                : layerDetails.data.featureType.nativeBoundingBox.crs ;
                        layer.data.metadata.recalculateBounds = layerDetails.data.featureType.metadata.entry.$;   // translate the map to an object
                        layer.data.center =                                                     // set the data center point
                            [layerDetails.data.featureType.latLonBoundingBox.minx, layerDetails.data.featureType.latLonBoundingBox.maxy] ;
                        break;
                }
                layer.layer.storeName = this.splitString(layer.layer.storeId,":")[1];           // set the store name
                console.warn("getLayerDetails: nativeBoundingBox.crs: " + layer.data.nativeBoundingBox.crs);
                return { ...layer};
            })
            .catch(error => {
                console.error("getLayerDetails ERROR!" + error);
                throw new Error(error)
            });
    }

    // 3. get the layer's store data (for the format) according to the layer's type and the layer title (in the layer's details)
    static getStoreData(worldName: string, layer: IWorldLayer): Promise<any> {
        console.warn("start the GET STORE DATA service..." + layer.layer.storeName);
        return axios
            .get(`${this.baseGeoUrl}/store/${worldName}/${layer.layer.storeName}/${layer.layer.type}`)
            .then(store => {
                console.log("getStoreData: store: " + store.data.dataStore);
                console.warn("getStoreData: connectionParameters.entry: " + store.data.dataStore.connectionParameters.entry);
                // get the store data according to the layer's type
                switch (layer.layer.type) {
                    case ('RASTER'):
                        layer.store = store.data.coverageStore;
                        layer.store.format = store.data.coverageStore.type.toUpperCase();   // set the store format
                        layer.layer.filePath = store.data.coverageStore.url;                // set the file path
                        layer.store.connectionParameters.namespace = store.data.coverageStore.connectionParameters.entry[0].$;  // translate the map to an object
                        break;
                    case ('VECTOR'):
                        layer.store = store.data.dataStore;
                        layer.store.format = store.data.dataStore.type.toUpperCase();       // set the store format
                        layer.store.connectionParameters.namespace = store.data.dataStore.connectionParameters.entry[0].$;  // translate the map to an object
                        layer.store.connectionParameters.url = store.data.dataStore.connectionParameters.entry[1].$;        // translate the map to an object
                        layer.layer.filePath = layer.store.connectionParameters.url                                         // set the file path
                        // layer.layer.filePath = this.getVectorUrl(store.data.dataStore.connectionParameters.entry);       // set the file path
                        break;
                }
                layer.store.storeId = layer.layer.storeId;
                layer.store.name = layer.layer.storeName;
                layer.store.type = layer.layer.type;
                layer.layer.fileName = this.getSubstring(layer.layer.filePath, layer.store.name);   // set the file name
                layer.layer.fileExtension = this.getSubstring(layer.layer.filePath, ".");           // set the file extension
                return { ...layer};
            })
            .catch(error => {
                console.error("getStoreData ERROR!" + error);
                throw new Error(error)
            });
    }

    // 4. get the data of the image file
    static getImageData(url: string): Promise<any> {
        console.log("geotiff: " + GeoTIFF);
        return GeoTIFF.fromUrl("file://C:/dev/Terrabiks/geoserver/rasters/SugarCane.tif")
            .then( tiff => {
                console.log("geotiff tiff: " + JSON.stringify(tiff));
                tiff.getImage()
                    .then( image => {
                        console.log("geotiff image: " + JSON.stringify(image));
                        image.readRasters()
                    })
                    .then ( raster => {
                        console.log("geotiff raster: " + JSON.stringify(raster));
                    })
            });
    }

    // get Capabilities
    static getCapabilities (worldName: string, layerName: string): Promise<any> {
        console.log("start the GET CAPABILITIES service..." + layerName);
        return axios
            .get(`${this.baseGeoUrl}/wmts/${worldName}/${layerName}`)
            .then(xml => xml.data )
            .catch(error => { throw new Error(error) });
    }

    // ==============
    // DELETE Request
    // ==============
    // delete layer from geoserver
    static deleteLayerById(worldName: string, layer: IWorldLayer): Promise<any> {
        console.warn("start the DELETE LAYER service for layer: " + layer.worldLayerId);
        // 1. delete the layer from the store - using the resource url (raster or vector)
        return this.deleteLayerFromStroe(worldName, layer.name)
        // 2. delete the store
            .then ( response => this.deleteStroe(worldName, layer.layer.storeName, layer.layer.type))
            // 3. delete the layer from the layers' list
            .then ( response => this.deleteLayer(layer.worldLayerId))
            .catch(error => {
                console.error("LAYER SERVICE: deleteLayer ERROR!" + error);
                throw new Error(error)
            });
    }

    // 1. delete the layer from the store by using the resource url (raster or vector)
    static deleteLayerFromStroe(worldName: string, layerName: string): Promise<any> {
        return axios.delete(`${this.baseGeoUrl}/delete/${worldName}/${layerName}`)
            .then(res => res.data)
            .catch(error => { throw new Error(error) });
    }

    // 2. delete the store
    static deleteStroe(worldName: string, storeName: string, storeType: string): Promise<any> {
        return axios.delete(`${this.baseGeoUrl}/delete/store/${worldName}/${storeName}/${storeType}`)
            .then(res => res.data)
            .catch(error => { throw new Error(error) });
    }

    // 3. delete the layer from the layers' list
    static deleteLayer(layerId: string): Promise<any> {
        return axios.delete(`${this.baseGeoUrl}/delete/${layerId}`)
            .then(res => res.data)
            .catch(error => { throw new Error(error) });
    }

    // ====================================== Private Functions ==============================================
    // get the url from a Vector file
    private static getVectorUrl = (entries) : string => (entries.find( entry => ( entry["@key"] === 'url')).$);

    // split String into array
    private static splitString = (id: string, splitSign: string): string[] => id.split(splitSign);

    // get a substring from giving string by giving word or sign
    private static getSubstring = (path: string, name: string): string => path.substring(path.lastIndexOf(name));

}

/*
// delete layer without a specific order (using Promise.all())
    // delete layer from geoserver
    static deleteLayerById(worldName: string, layer: ILayer): Promise<any> {
        console.log("start the DELETE LAYER service for layer: " + layer.id);
        const promises = [
            // 1. delete the layer from the store - using the resource url (raster or vector)
            this.deleteLayerFromStroe(worldName, layer.name),
            // 2. delete the store
            this.deleteStroe(worldName, layer.storeId, layer.type),
            // 3. delete the layer from the layers' list
            this.deleteLayer(layer.id)
        ];
        return Promise.all(promises)
            .then( data => data)
            .catch ( error => error);
    }
*/
