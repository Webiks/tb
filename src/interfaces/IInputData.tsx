import { AFFILIATION_TYPES } from '../consts/layer-types';

export interface IInputdata {
    name: string,
    sensor: ISensor,
    tb?: ITb,
    ol?: IopenLayers,
    ansyn?: IAnsyn
}

export interface ISensor {
    type?: string,
    name?: string,
    maker?: string,
    bands?: string[]
}

export interface ITb {
    affiliation: AFFILIATION_TYPES,
    GSD: number,                         // units: cm (raster only)
    flightAltitude: number,              // units: meters
    cloudCoveragePercentage?: number     // units: %  raster only)
}

export interface IopenLayers {
    zoom: number,
    opacity: number,
}

export interface IAnsyn {
    title?: string
}


