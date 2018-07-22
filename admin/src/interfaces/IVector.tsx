import {
    ICrs,
    ILatLonBoundingBox,
    INameSpace,
    INativeBoundingBox,
    ILayerStore,
    IStrings,
    IMetaData
} from './ILayerDetails';

export interface IVector {
    name: string,
    nativeName?: string,
    nameSpace?: INameSpace,
    title?: string,
    keywords?: IStrings,
    description?: string,
    keyword?: IStrings,
    nativeCRS?: string | ICrs                   // define as a Map in the mongoDB
    srs: string,
    nativeBoundingBox: INativeBoundingBox,
    latLonBoundingBox: ILatLonBoundingBox,
    center: [ number, number],
    projectionPolicy?: string,
    enabled?: boolean,
    metadata?: IMetaData,                       // define as a Map in the mongoDB
    store: ILayerStore,
    maxFeatures: number,
    numDecimals: number,
    overridingServiceSRS: boolean,
    skipNumberMatched: boolean,
    circularArcPresent: boolean,
    attributes: IAttributes
}

export interface IAttributes {
    attribute: IAttribute[]
}

export interface IAttribute {
    name: string,
    minOccurs: number,
    maxOccurs: number,
    nillable: boolean,
    binding: string
}