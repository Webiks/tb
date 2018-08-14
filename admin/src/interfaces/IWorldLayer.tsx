import { ILayer } from "./ILayer";
import { IStore } from './IStore';
import { IImageData } from './IImageData';
import { IInputdata } from './IInputData';
import { ILayerDetails } from './ILayerDetails';
import { Feature, Polygon } from 'geojson';

export interface IWorldLayer {
    _id: string;
    workspaceName: string;
    worldLayerId: string;           // get from the resource.name from getInfo
    name: string;
    date: string;
    href?: string;
    layer: ILayer;                  // layer data from geoserver
    store: IStore;                  // store store data from geoserver (coverStore or dataStore)
    data:  ILayerDetails;           // raster or vector data from geoserver
    imageData: IImageData;          // data from the image file
    inputData: IInputdata;          // data from the user
    // for ANSYN: get the polygon from the latLonBoundingBox field in the data field
    footprint: Feature<Polygon>;
}
