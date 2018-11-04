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
    href?: string;
    fileName: string;
    filePath: string;
    fileType: string;                // enum: ['raster', 'vector', 'image']
    format: string;                  // enum: ['GEOTIFF', 'SHAPEFILE', 'JPG'],
    layer?: ILayer;                  // layer data from geoserver
    store?: IStore;                  // store store data from geoserver (coverStore or dataStore)
    data?:  ILayerDetails;           // raster or vector data from geoserver
    fileData: IFileData;             // data from the upload file
    imageData?: IImageData;          // data from an image file
    inputData: IInputdata;           // data from the user
    geoData: IGeoData                // geo api-data for Ansyn app
}

export interface IGeoData {
    centerPoint: number[];
    bbox: number[];                     // [ minx, miny, maxx, maxy ]
    footprint: Feature<Polygon>;
}
