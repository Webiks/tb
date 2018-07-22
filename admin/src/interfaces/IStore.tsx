import { IEntry } from './ILayerDetails';

export interface IStore {
    name: string,
    type: string,
    format: string,                             // type: 'GeoTiff' or 'Shapfile'
    enable: boolean,
    _default: boolean,
    workspace: IWorkspace,
    connectionParameters?: IConnectParmas,     // define as a Map in the mongoDB
    href: string,                              // the 'coverages' field in RASTERS or the 'featureTypes' field in VECTORS
    url?: string                               // only in RASTERS
}

export interface IWorkspace {
    name: string,
    href: string
}

export interface IConnectParmas {
    entry: IEntry | IEntry[]
}





