import { IStore } from './IStore';

export interface ILayer {
    id: string,                     // 'worldname:layername'
    name: string,
    type: string,                   // 'RASTER' or 'VECTOR'
    storeName: string,
    filePath: string,
    fileName: string,
    fileExtension: string,
    defaultStyle: IDefaultStyle,
    resource: IResource,
    attribution: IAttribution
}

export interface IDefaultStyle {
    name: string,
    href: string
}

export interface IResource {
    class: string
    name: string,
    href: string
}

export interface IAttribution {
    logoWidth: number,
    logoHeight: number
}