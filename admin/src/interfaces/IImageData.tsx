export interface IImageData {
    image?: IImage,
    photo?: IPhoto
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