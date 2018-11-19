import axios from 'axios';
import { GeoTIFF } from 'geotiff';
import config from '../config/config';
import { IWorldLayer } from '../interfaces/IWorldLayer';

export class LayerService {

    static baseUrl: string = `${config.baseUrl}/v1/api/dbLayers`;

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
    static createLayer(newLayer: IWorldLayer, worldId: string): Promise<any> {
        console.log(`start the CREATE LAYER service...${this.baseUrl}/${worldId}/${newLayer.name}`);
        console.log('newLayer: ' + JSON.stringify(newLayer));
        return axios
            .post(`${this.baseUrl}/${worldId}/${newLayer.name}`, newLayer)
            .then(res => res.data)
            .catch(error => this.handleError(error, `LAYER SERVICE: FAILED to create a new Layer: ${error}`));
    }

    // ==============
    //  GET Requests
    // ==============
    // get the Layers list from the Database
    static getLayers(): Promise<any> {
        console.warn('start the getLayers service...', this.baseUrl);
        return axios
            .get(this.baseUrl)
            .then(res => res.data)
            .then(data => data.map((layer: any) => layer))
            .catch(error => this.handleError(error, `LAYER SERVICE: There are NO Layers!!!: ${error}`));
    }

    // get one Layer from the Database
    static getLayer(layerId: string): Promise<any> {
        console.log(`start the GET LAYER INFO service...${this.baseUrl}/${layerId}`);
        return axios
            .get(`${this.baseUrl}/${layerId}`)
            .then(layers => layers.data)
            .catch(error => this.handleError(error, `LAYER SERVICE: There is NO such Layer!!!: ${error}`));
    }

    // =================
    //  UPDATE Requests
    // =================
    //  UPDATE an existing world with a new world
    static updateLayer(oldLayer: IWorldLayer, newLayer: IWorldLayer): Promise<any> {
        newLayer._id = oldLayer._id;
        console.log('start the UPDATE LAYER service...', oldLayer.name);
        return axios
            .put(`${this.baseUrl}/${oldLayer.name}`, newLayer)
            .then(res => res.data)
            .catch(error => this.handleError(error, `WORLD SERVICE: FAILED to update the World: ${error}`));
    }

    //  UPDATE a single Field in an existing world
    static updateLayerField(layer: IWorldLayer, fieldName: string, fieldValue: any): Promise<any> {
        console.log(`start the UPDATE LAYER's FIELD service...${layer.name}, ${fieldName}`);
        return axios
            .put(`${this.baseUrl}/${layer._id}/${fieldName}`, { newValue: fieldValue })
            .then(res => res.data)
            .catch(error => this.handleError(error, `LAYER SERVICE: FAILED to update the Layer: ${error}`));
    }

    // ==============
    // DELETE Request
    // ==============
    // delete a layer from the Database (remove from the 'layres' array-field inside the World Model)
    static deleteWorldLayer(worldId: string, layer: IWorldLayer): Promise<any> {
        console.log(`start the DELETE LAYER service for layer ${layer.name}`);
        let data;
        if (layer.fileType === 'image'){
            data = {
                worldId,
                layerId: layer._id,
                layerName: layer.name,
                type: layer.fileType,
                path: layer.filePath
            };
        } else {
            data = {
                worldId,
                layerId: layer._id,
                layerName: layer.name,
                type: layer.fileType,
                resourceUrl: layer.geoserver.layer.resource.href,
                storeUrl: layer.geoserver.data.store.href,
                path: layer.fileData.zipPath
            };
        }

        return axios
            .delete(`${this.baseUrl}/delete/${worldId}/${layer._id}`, { data })
            .then(res => {
                console.log(`LAYER SERVICE: SUCCEED to delete Layer ${layer.name}`);
                return res.data;
            })
            .catch(error => this.handleError(error, `LAYER SERVICE: FAILED to delete Layer ${layer.name}: ${error}`));
    }

    // ===================
    //  GEOSERVER METHODS
    // ===================
    // get a List of all the world's layers (IWorldLayer: name + href) from Geoserver
    static getWorldLayersFromGeoserver(worldId: string): Promise<any> {
        console.log('start the GET LAYERS service...', worldId);
        return axios
            .get(`${this.baseUrl}/geoserver/${worldId}`)
            .then(layers => layers.data)
            .catch(error => this.handleError(error, `LAYER SERVICE: Get WorldLayers From Geoserver error: ${error}`));
    }

    // get the data of each layer in the world from Geoserver
    static getAllLayersData(worldId: string, list: IWorldLayer[]): Promise<any> {
        console.log('start the getLayersDataByList...');
        const promises = list.map((worldLayer: IWorldLayer) => {
            console.log('start the getLayersDataByList map...', worldLayer.name);
            return this.getLayerData(worldId, worldLayer);
        });
        return Promise.all(promises);
    }

    // get all the layer's Data (from Geoserver and from the image file)
    static getLayerData(worldId: string, worldLayer: IWorldLayer): Promise<any> {
        console.warn('start the GET LAYERS DATA service...', worldLayer.name);
        const layer = worldLayer;
        console.log('0. getLayerData worldLayer: ');
        // 1. get data from GeoServer
        return this.getGeoserverData(worldId, layer)
            .then(geolayer => geolayer)
            .catch(error => this.handleError(error, `LAYER SERVICE: Get Layer Data error: ${error}`));
    };

    // 1. get data from GeoServer
    static getGeoserverData(worldId: string, worldLayer: IWorldLayer): Promise<any> {
        console.log('LayerService getGeoserverData: ' + JSON.stringify(worldLayer));
        return axios
            .get(`${this.baseUrl}/geoserver/${worldId}/${worldLayer.name}`)
            .then(layerData => {
                return { ...worldLayer, ...layerData.data };
            })
            .catch(error => this.handleError(error, `LAYER SERVICE: Get Geoserver Data error: ${error}`));
    }

    // get Capabilities (from Geoserver)
    static getCapabilities(worldId: string, layerName: string): Promise<any> {
        console.log(`start the GET CAPABILITIES service...${this.baseUrl}/geoserver/wmts/${worldId}/${layerName}`);
        return axios
            .get(`${this.baseUrl}/geoserver/wmts/${worldId}/${layerName}`)
            .then(xml => xml.data)
            .catch(error => this.handleError(error, `LAYER SERVICE: Get Capabilities error: ${error}`));
    }
}

