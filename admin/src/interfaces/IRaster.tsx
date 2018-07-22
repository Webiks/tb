import {
    ICrs,
    ILatLonBoundingBox,
    INativeBoundingBox,
    ILayerStore,
    IStrings,
    IMetaData,
    INameSpace
} from './ILayerDetails';

export interface IRaster {
    name: string,
    nativeName?: string,
    nameSpace?: INameSpace,
    title?: string,
    nativeCRS?: string | ICrs,                  // define as a Map in the mongoDB
    keywords?: IStrings,
    srs: string,
    nativeBoundingBox: INativeBoundingBox,
    latLonBoundingBox: ILatLonBoundingBox,
    center: [ number, number],
    projectionPolicy?: string,
    enabled?: boolean,
    metadata?: IMetaData,                       // define as a Map in the mongoDB
    store: ILayerStore,
    nativeFormat: string,
    grid?: IGrid,
    supportedFormats?: string[],
    interpolationMethods?: IStrings,
    defaultInterpolationMethod?: string,
    dimensions: IDimensions,
    requestSRS: IStrings,
    responseSRS: IStrings,
    parameters: IParameters
}

export interface IGrid {
    dimension: number,
    range: IGridRange,
    transform: ITransform,
    crs: string
}
export interface IGridRange {
    low: string,
    high: string
}

export interface ITransform {
    scaleX: number,
    scaleY: number,
    shearX: number,
    shearY: number,
    translateX: number,
    translateY: number
}

export interface IDimensions {
    coverageDimension: ICoverageDimension[]
}

export interface ICoverageDimension {
    name: string,
    description: string,
    range: ICoverageRange,
    nullValues: INullValues,
    unit: string,
    dimensionType: IDimensionType
}

export interface ICoverageRange {
    min: number | string,
    max: number | string
}

export interface INullValues {
    double: number[]
}

export interface IDimensionType {
    name: string
}

export interface IParameters {
    entry: IStrings[]
}