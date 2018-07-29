// Layer Data: Raster and Vector Interfaces
export interface ILayerDetails {
    name: string,
    nativeName?: string,
    nameSpace?: INameSpace,
    title?: string,
    description?: string,
    keyword?: IStrings,
    nativeCRS?: string | ICrs
    srs: string,
    nativeBoundingBox: INativeBoundingBox,
    latLonBoundingBox: ILatLonBoundingBox,
    center: [ number, number],
    projectionPolicy?: string,
    enabled?: boolean,
    metadata?: IMetaData,
    store: IDataStore,
    // Vectors only
    maxFeatures: number,
    numDecimals: number,
    overridingServiceSRS: boolean,
    skipNumberMatched: boolean,
    circularArcPresent: boolean,
    attributes: IAttributes,
    // Rasters Only
    nativeFormat: string,
    grid?: IGrid,
    supportedFormats?: IStrings,
    interpolationMethods?: IStrings,
    defaultInterpolationMethod?: string,
    dimensions: IDimensions,
    requestSRS: IStrings,
    responseSRS: IStrings,
    parameters: IParameters
}

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
    entry?: IEntry,
    dirName?: string,                   // Rasters
    recalculateBounds?: string         // Vectors
}

export interface IEntry {
    key: string,
    value: any
}

export interface IDataStore {
    class: string,
    name: string
    href: string
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
    nullValues: InullValues,
    unit: string,
    dimensionType: IDimensionType
}

export interface ICoverageRange {
    min: number | string,
    max: number | string
}

export interface InullValues {
    double: [ number ]
}

export interface IDimensionType {
    name: string
}

export interface IParameters {
    entry: IStrings[]
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



