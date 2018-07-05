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
    crs?: string | ICrs
}

export interface ILatLonBoundingBox {
    minx: number,
    maxx: number,
    miny: number,
    maxy: number,
    crs: string
}

export interface ICrs {
    class: string,
    value: string
}

export interface IMetaData {
    entry: IEntry | IEntry[]
}

export interface IEntry {
    key: string,
    value: any
}

export interface ILayerStore {
    class: string,
    name: string
    href: string
}



