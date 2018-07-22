// shared Raster and Vector Interfaces

export interface INameSpace {
    name: string,
    href: string
}

export interface IStrings {
    string: string[]
}

export interface INativeBoundingBox {
    minx: number,
    maxx: number,
    miny: number,
    maxy: number,
    crs?: string | ICrs                     // define as a Map in the mongoDB
}

export interface ILatLonBoundingBox {
    minx: number,
    maxx: number,
    miny: number,
    maxy: number,
    crs: string
}

// define as a Map in the mongoDB
export interface ICrs {
    class: string,
    value: string
}

// define as a Map in the mongoDB
export interface IMetaData {
    entry: IEntry | IEntry[]
}

// define as a Map in the mongoDB
export interface IEntry {
    key: string,
    value: any
}

export interface ILayerStore {
    class: string,
    name: string
    href: string
}



