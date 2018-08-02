import axios from 'axios';
import { GeoTIFF } from 'geotiff';
import config from "../config/config";
import { IWorldLayer } from "../interfaces/IWorldLayer";

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
    // create a bew world-Layer in  the Database (add to the 'layres' array-field inside the World Model)
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
    // delete a layer from the Database (remove from the 'layres' array-field inside the World Model)
    static deleteWorldLayer(worldLayer: IWorldLayer): Promise<any> {
        console.warn("start the DELETE LAYER service for layer: " + worldLayer.name + ', ' + worldLayer._id);
        return axios
            .delete(`${this.baseUrl}/delete/${worldLayer.worldName}/${worldLayer._id}`)
            .then(res => {
                console.log("LAYER SERVICE: SUCCEED to delete Layer: " + worldLayer.name + ", id: " + worldLayer._id);
                return res.data;
            })
            .catch(error => console.error("LAYER SERVICE: FAILED to delete Layer: " + worldLayer.name + " error: " + error));
    }

    // ===================
    //  GEOSERVER METHODS
    // ===================
    // get a List of all the world's layers (IWorldLayer: name + href) from Geoserver
    static getWorldLayersFromGeoserver(worldName: string): Promise<any> {
        console.log("start the GET LAYERS service..." + worldName);
        return axios
            .get(`${this.baseUrl}/geoserver/${worldName}`)
            .then(layers => layers.data)
            .catch(error => {
                console.error("getLayers ERROR!" + error.message);
                throw new Error(error);
            });
    }

    // get the data of each layer in the world from Geoserver
    static getAllLayersData(worldName: string, list: IWorldLayer[]): Promise<any> {
        console.log("start the getLayersDataByList...");
        const promises = list.map((worldLayer: IWorldLayer) => {
            console.log("start the getLayersDataByList map..." + worldLayer.name);
            return this.getLayerData(worldName, worldLayer)
        });
        return Promise.all(promises);
    }

    // get all the layer's Data (from Geoserver and from the image file)
    static getLayerData(worldName: string, worldLayer: IWorldLayer): Promise<any> {
        console.warn("start the GET LAYERS service..." + worldLayer.name);
        const layer = worldLayer;
        layer.worldName = worldName;                                      // set the world name
        console.log("0. getLayerData worldLayer: " + JSON.stringify(layer));
        // 1. get data from GeoServer
        return this.getGeoserverData(worldName, layer)
            . then ( layer => layer )
            // // 2. get the image data from the file using the Geotiff
            // .then( layer => {
            //     console.warn("service: File Path: " + layer.layer.filePath);
            //     // this.getImageData(layer.layer.filePath)
            //     this.getImageData(`file://C:/dev/Terrabiks/geoserver/rasters/SugarCane.tif`)
            //         .then ( imageData => {
            //             return {...layer, ...imageData };
            //         })
            //         .catch(error => {
            //             console.error("getImageData ERROR!" + error);
            //             throw new Error(error)
            //         });
            // })
            .catch(error => {
                console.error("getLayer ERROR!" + error);
                throw new Error(error)
            });
    };

    // 1. get data from GeoServer
    static getGeoserverData(worldName: string, worldLayer: IWorldLayer): Promise<any> {
        return axios
            .get(`${this.baseUrl}/geoserver/${worldName}/${worldLayer.name}`)
            .then(layerData => {
                return {...worldLayer, ...layerData.data}
            })
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
                    .catch(error => { throw new Error(error) });
            });
    }

    // get Capabilities (from Geoserver)
    static getCapabilities (worldName: string, layerName: string): Promise<any> {
        console.log("start the GET CAPABILITIES service..." + `${this.baseUrl}/geoserver/wmts/${worldName}/${layerName}`);
        return axios
            .get(`${this.baseUrl}/geoserver/wmts/${worldName}/${layerName}`)
            .then(xml => xml.data )
            .catch(error => { throw new Error(error) });
    }

    // ==============
    // DELETE Request
    // ==============
    // delete layer from geoserver
    static deleteLayerfromGeoserver(worldName: string, layerId: string): Promise<any> {
        console.warn("start the DELETE LAYER service for layer: " + layerId);
        // 1. delete the layer from the store - using the resource url (raster or vector)
        return axios.delete(`${this.baseUrl}/delete/${worldName}/${layerId}`)
            .then(res => res.data)
            .catch(error => { throw new Error(error) });

    }

    // // 1. delete the layer from the store by using the resource url (raster or vector)
    // static deleteLayerFromStroe(worldName: string, layerName: string): Promise<any> {
    //     return axios.delete(`${this.baseGeoUrl}/delete/${worldName}/${layerName}`)
    //         .then(res => res.data)
    //         .catch(error => { throw new Error(error) });
    // }
    //
    // // 2. delete the store
    // static deleteStroe(worldName: string, storeName: string, storeType: string): Promise<any> {
    //     return axios.delete(`${this.baseGeoUrl}/delete/store/${worldName}/${storeName}/${storeType}`)
    //         .then(res => res.data)
    //         .catch(error => { throw new Error(error) });
    // }
    //
    // // 3. delete the layer from the layers' list
    // static deleteLayer(layerId: string): Promise<any> {
    //     return axios.delete(`${this.baseGeoUrl}/delete/${layerId}`)
    //         .then(res => res.data)
    //         .catch(error => { throw new Error(error) });
    // }

    // ====================================== Private Functions ==============================================
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
