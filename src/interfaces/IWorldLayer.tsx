import { ILayer } from "./ILayer";
import { IStore } from './IStore';
import { IImageData } from './IImageData';
import { IInputdata } from './IInputData';
import { ILayerDetails } from './ILayerDetails';
import { Feature, Polygon } from 'geojson';
import { IFileData } from './IFileData';

export interface IWorldLayer {
    _id: string;
    name: string;
    fileName: string;
    filePath: string;
    fileType: string;                // ['raster', 'vector', 'image']
    format: string;                  // ['GEOTIFF', 'SHAPEFILE', 'JPG']
    lastModified?: number;           // Created Date in numbers (from 1.1.1970)
    fileData: IFileData;             // data from the upload file
    inputData: IInputdata;           // data from the user
    geoData: IGeoData                // geo api-data for Ansyn app
    imageData?: IImageData;          // data from an image file
    geoserver?: IGeoserver            // geoserver data (layers, stores, rasters and vectors
}

export interface IGeoData {
    centerPoint: number[];
    bbox: number[];                     // [ minx, miny, maxx, maxy ]
    footprint: Feature<Polygon>;
}

export interface IGeoserver {
    layer: ILayer;                  // layer data from geoserver
    store: IStore;                  // store store data from geoserver (coverStore or dataStore)
    data:  ILayerDetails;           // raster or vector data from geoserver
}
