export interface IImageMetaData {
    JPGModifiedDate: Date | string;
    JPGOriginalDate: Date | string;
    ImageDescription?: string;
    Make: string;
    Model: string;
    SerialNumber?: string;
    InteropIndex?: string;
    ExifImageWidth: number;
    ExifImageHeight: number;
    Orientation: number;
    XResolution: number;
    YResolution: number;
    ResolutionUnit: number;
    Software?: string;
    ModifyDate: number;
    DateTimeOriginal: number;
    CreatedDate: number;
    YCbCrPosition: number;
    XPComment?: number[];
    XPKeywords?: number[];
    GPSVersionId: [number, number, number, number];
    GPSLatitudeRef: string;
    GPSLatitude: number;
    GPSLongitudeRef: string;
    GPSLongitude: number;
    GPSAltitude: number;
    ExposureTime?: number;
    ExposureProgram?: number;
    ExposureCompensation?: number;
    ExposureIndex?: string;
    ExposureMode?: number;
    FNumber?: number;
    ISO?: number;
    CompressedBitPerPixel?: number;
    ShutterSpeedValue?: number;
    ApertureValue?: number;
    MaxApertureValue?: number;
    SubjectDistance?: number;
    SubjectDistanceRange?: number;
    MeteringMode?: number;
    LightSource?: number;
    Flash?: number;
    FocalLength?: number;
    FocalLengthIn35mmFormat?: number;
    ColorSpace?: number;
    CustumRendered?: number;
    WhiteBalance?: number;
    DigitalZoomRatio?: string;
    SceneCaptureType?: number;
    GainControl?: number;
    Contrast?: number;
    Saturation?: number;
    Sharpness?: number;
}