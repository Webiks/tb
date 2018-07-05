import { IEntry } from './ILayerDetails';

export interface IStore {
    name: string,
    type: string,
    format: string,                         // type: 'GeoTiff' or 'Shapfile'
    enable: boolean,
    workspace: IWorkspace,
    _default: boolean,
    url?: string,                           // only in RASTERS
    coverage?: string,                      // only in RASTERS
    featureType?: string                    // only in VECTORS
    connectionParameters?: IConnectParmas   // only in VECTORS

}

export interface IWorkspace {
    name: string,
    href: string
}

export interface IConnectParmas {
    entry: IEntry[]
}

