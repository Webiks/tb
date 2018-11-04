import { IEntry } from './ILayerDetails';

export interface IStore {
    storeId: string,                        // get from the details page (RASTER/VECTOR) store's name field
    name: string,
    type: string,                           // RASTER or VECTOR: get from the Layer page's type
    enable: boolean,
    workspace: IWorkspace,
    _default: boolean,
    connectionParameters?: IConnectParmas,  // only in VECTORS
    url?: string,                           // only in RASTERS
    href: string                            // get from the "coverages"  in RASTERS or "featureTypes" in VECTORS
}

export interface IWorkspace {
    name: string,
    href: string
}

export interface IConnectParmas {
    entry?: IEntry | IEntry[],
    namespace?: string,
    url?: string
}

