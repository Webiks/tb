export interface ILayer {
    name: string,
    type: string,                   // 'RASTER' or 'VECTOR'
    defaultStyle: IDefaultStyle,
    resource: IResource,
    attribution: IAttribution,
    storeId: string,                // get from the details page (RASTER/VECTOR) store's name field
    storeName: string,              // get from the store's name field
    filePath: string,               // get from the store's url field
    fileName: string,               // get from the store's url field
    fileExtension: string           // get from the store's url field
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