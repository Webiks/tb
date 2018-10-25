import { ILayer } from './ILayer';
import { IStore } from './IStore';
import { IInputdata } from './IInputData';
import { ILayerDetails } from './ILayerDetails';
import { Feature, Polygon, BBox } from 'geojson';
import { IFileData } from './IFileData';
import { IImageMetaData } from './IImageMetaData';

export interface IWorldLayer {
    _id?: string;
    workspaceName: string;
    worldLayerId?: string;           // get from the resource.name from getInfo
    name: string;
    href?: string;
    fileName: string;
    filePath: string;
    fileType: string;                // 'raster', 'vector', 'image'
    format: string;                  // get from the store type: 'GeoTiff' or 'Shapfile' or 'JPG'
    layer?: ILayer;                  // layer data from geoserver
    store?: IStore;                  // store store data from geoserver (coverStore or dataStore)
    data?:  ILayerDetails;           // raster or vector data from geoserver
    fileData: IFileData;             // data from the upload file
    imageData?: IImageMetaData;      // data from the image file (for JPG)
    inputData?: IInputdata;          // data from the user
    // for ANSYN: get the polygon from the latLonBoundingBox field in the data field
    geoData: IGeoData
}

export interface IGeoData {
    centerPoint: number[];
    bbox: BBox;                  // [ minx, miny, maxx, maxy ]
    footprint: Feature<Polygon>;
}



