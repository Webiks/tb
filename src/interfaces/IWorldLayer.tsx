import { ILayer } from "./ILayer";
import { IStore } from './IStore';
import { IImageData } from './IImageData';
import { IInputdata } from './IInputData';
import { ILayerDetails } from './ILayerDetails';
import { Feature, Polygon, Point } from 'geojson';
import { IFileData } from './IFileData';

export interface IWorldLayer {
    _id: string;
    name: string;
    fileName: string;
    filePath: string;
    displayUrl: string;
    thumbnailUrl: string;
    fileType: string;                // ['raster', 'vector', 'image']
    createdDate: number;             // Created Date in numbers (from 1.1.1970)
    fileData: IFileData;             // data from the upload file
    inputData: IInputdata;           // data from the user
    geoData: IGeoData                // geo api-data for Ansyn app
    imageData?: IImageData;          // data from an image file
    geoserver?: IGeoserver            // geoserver data (layers, stores, rasters and vectors
}

export interface IGeoData {
    footprint: Feature<Polygon>;
    droneCenter: Feature<Point>;
    centerPoint: number[];
    bbox: number[];                     // [ minx, miny, maxx, maxy ]
    isGeoRegistered: boolean;
}

export interface IGeoserver {
    layer: ILayer;                  // layer data from geoserver
    store: IStore;                  // store store data from geoserver (coverStore or dataStore)
    data:  ILayerDetails;           // raster or vector data from geoserver
}
