export interface IImageData {
    file: IFile,
    image?: IImage,
    photo?: IPhoto
}

export interface IFile {
    name: string,
    type: string,                            // TIF or SHX
    folderPath: string,
    dateCreated: Date,
    dateModified: Date,
    size: number,                           // MB or KB
    attribute: string
}

export interface IImage {
    width: number,                          // pixels
    height: number,                         // pixels
    horizontalResolution: number,           // dpi
    verticalResolution: number,             // dpi
    bitDepth: number,
    compression?: string
}

export interface IPhoto {
    photometricInterpretation: string       // RGB
}
