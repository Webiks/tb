import axios from 'axios';
import { GeoTIFF } from 'geotiff';
import config from "../config/config";
import { IWorldLayer } from "../interfaces/IWorldLayer";

export class LayerService {

    static baseUrl: string = `${config.baseUrl}/api/dbLayers`;

    // Handle ERRORS
    static handleError = (error, message) => {
        console.error(message);
        throw new Error(error);
    };

    // ========================
    //  MONGO DATABASE METHODS
    // ========================
    // ====================
    //  CREATE a new Layer
    // ====================
    static createLayer(newLayer: IWorldLayer): Promise<any> {
        console.log("start the CREATE LAYER service..." + `${this.baseUrl}/${name}`);
        return axios
            .post(`${this.baseUrl}/${newLayer.name}`, newLayer)
            .then(res => res.data)
            .catch(error => this.handleError(error, "LAYER SERVICE: FAILED to create a new Layer: " + error));
    }

    // ==============
    //  GET Requests
    // ==============
    // get the Layers list from the Database
    static getLayers(): Promise<any> {
        console.warn("start the getLayers service..." + this.baseUrl);
        return axios
            .get(this.baseUrl)
            .then(res => res.data)
            .then(data => data.map((layer: any) => layer))
            .catch(error => this.handleError(error, "LAYER SERVICE: There are NO Layers!!!: " + error));
    }

    // get all World's Layers list from the Database
    // static getAllWorldLayers(worldName: string): Promise<any> {
    //     console.log("start the GET All WORLD'S LAYERS service..." + worldName);
    //     return axios
    //         .get(`${this.baseUrl}/${worldName}`)
    //         .then(layers => layers.data)
    //         .catch(error => this.handleError(error, "LAYER SERVICE: There are NO Layers!!!: " + error));
    // }

    // get one Layer from the Database
    static getLayer(layerId: string): Promise<any> {
        console.log("start the GET LAYER INFO service..." + `${this.baseUrl}/${layerId}`);
        return axios
            .get(`${this.baseUrl}/${layerId}`)
            .then(layers => layers.data)
            .catch(error => this.handleError(error, "LAYER SERVICE: There is NO such Layer!!!: " + error));
    }

    // =================
    //  UPDATE Requests
    // =================
    //  UPDATE an existing world with a new world
    static updateLayer(oldLayer: IWorldLayer, newLayer: IWorldLayer): Promise<any> {
        newLayer._id = oldLayer._id;
        console.log("start the UPDATE LAYER service..." + oldLayer.name);
        return axios
            .put(`${this.baseUrl}/${oldLayer.name}`, newLayer)
            .then(res => res.data)
            .catch(error => this.handleError(error, "WORLD SERVICE: FAILED to update the World: " + error));
    }

    //  UPDATE a single Field in an existing world
    static updateLayerField(layer: IWorldLayer, fieldName: string, fieldValue : any): Promise<any> {
        // const id = layer._id;
        // const data = {
        //     _id: id,
        //     newValue: fieldValue
        // };
        console.log("start the UPDATE LAYER's FIELD service..." + layer.name + ', ' + fieldName);
        return axios
            .put(`${this.baseUrl}/${layer._id}/${fieldName}`, { newValue: fieldValue })
            .then(res => res.data)
            .catch(error => this.handleError(error,"LAYER SERVICE: FAILED to update the Layer: " + error));
    }

    // ==============
    // DELETE Request
    // ==============
    // delete a layer from the Database (remove from the 'layres' array-field inside the World Model)
    static deleteWorldLayer(layerId: string): Promise<any> {
        console.log("start the DELETE LAYER service for layer id: " + layerId);
        return axios
            .delete(`${this.baseUrl}/delete/${layerId}`)
            .then(res => {
                console.log("LAYER SERVICE: SUCCEED to delete Layer id: " + layerId);
                return res.data;
            })
            .catch(error => this.handleError(error, "LAYER SERVICE: FAILED to delete Layer id: " + layerId + " error: " + error));
    }

    // ===================
    //  GEOSERVER METHODS
    // ===================
    // get a List of all the world's layers (IWorldLayer: name + href) from Geoserver
    static getWorldLayersFromGeoserver(workspaceName: string): Promise<any> {
        console.log("start the GET LAYERS service..." + workspaceName);
        return axios
            .get(`${this.baseUrl}/geoserver/${workspaceName}`)
            .then(layers => layers.data)
            .catch(error => this.handleError(error, "LAYER SERVICE: Get WorldLayers From Geoserver error: " + error));
    }

    // get the data of each layer in the world from Geoserver
    static getAllLayersData(workspaceName: string, list: IWorldLayer[]): Promise<any> {
        console.log("start the getLayersDataByList...");
        const promises = list.map((worldLayer: IWorldLayer) => {
            console.log("start the getLayersDataByList map..." + worldLayer.name);
            return this.getLayerData(workspaceName, worldLayer)
        });
        return Promise.all(promises);
    }

    // get all the layer's Data (from Geoserver and from the image file)
    static getLayerData(workspaceName: string, worldLayer: IWorldLayer): Promise<any> {
        console.warn("start the GET LAYERS service..." + worldLayer.name);
        const layer = worldLayer;
        layer.workspaceName = workspaceName;                                      // set the workspace name
        console.log("0. getLayerData worldLayer: ");
        // 1. get data from GeoServer
        return this.getGeoserverData(workspaceName, layer)
            . then ( layer => layer )
            // // 2. get the image data from the file using the Geotiff
            // .then( layer => {
            //     console.warn("service: File Path: " + layer.layer.filePath);
            //     // this.getImageData(layer.layer.filePath)
            //     this.getImageData(`file://C:/dev/Terrabiks/geoserver/rasters/SugarCane.tif`)
            //         .then ( imageData => {
            //             return {...layer, ...imageData };
            //         })
            //         .catch(error => this.handleError(error, "LAYER SERVICE: Get Image Data error: " + error));
            // })
            .catch(error => this.handleError(error, "LAYER SERVICE: Get Layer Data error: " + error));
    };

    // 1. get data from GeoServer
    static getGeoserverData(workspaceName: string, worldLayer: IWorldLayer): Promise<any> {
        return axios
            .get(`${this.baseUrl}/geoserver/${workspaceName}/${worldLayer.name}`)
            .then(layerData => {
                return {...worldLayer, ...layerData.data}
            })
            .catch(error => this.handleError(error, "LAYER SERVICE: Get Geoserver Data error: " + error));
    }

    // 2. get data from the image file
    static getImageData(url: string): Promise<any> {
        console.log("geotiff: " + GeoTIFF);
        return GeoTIFF.fromUrl("file://C:/dev/Terrabiks/geoserver/rasters/SugarCane.tif")
            .then( tiff => {
                console.log("geotiff tiff: " + JSON.stringify(tiff));
                tiff.getImage()
                    .then( image => {
                        console.log("geotiff image: " + JSON.stringify(image));
                        const raster = image.readRasters();
                        console.log("geotiff raster: " + JSON.stringify(raster));
                        return raster;
                    })
                    .catch(error => this.handleError(error, "LAYER SERVICE: Get Image Data error: " + error));
            });
    }

    // get Capabilities (from Geoserver)
    static getCapabilities (workspaceName: string, layerName: string): Promise<any> {
        console.log("start the GET CAPABILITIES service..." + `${this.baseUrl}/geoserver/wmts/${workspaceName}/${layerName}`);
        return axios
            .get(`${this.baseUrl}/geoserver/wmts/${workspaceName}/${layerName}`)
            .then(xml => xml.data )
            .catch(error => this.handleError(error, "LAYER SERVICE: Get Capabilities error: " + error));
    }
}

