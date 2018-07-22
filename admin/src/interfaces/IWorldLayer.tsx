import { ILayer } from "./ILayer";
import { IStore } from './IStore';
import { IImageData } from './IImageData';
import { IInputdata } from './IInputData';
import { IRaster } from './IRaster';
import { IVector } from './IVector';

export interface IWorldLayer {
    name: string,
    href?: string,
    layer: ILayer,                  // layer data from geoserver
    store: IStore                   // store store data from geoserver (coverStore or dataStore)
    data:  IRaster | IVector        // raster or vector data from geoserver
    imageData: IImageData           // data from the image file
    inputData: IInputdata          // data from the user
}

