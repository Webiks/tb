export interface IImageMetaData {
    Make: string;
    Model: string;
    modifyDate: Date | string;
    createdDate: Date | string;
    dateTimeOriginal: Date | string;
    GPSLatitudeRef: string;
    GPSLatitude: number;
    GPSLongitudeRef: string;
    GPSLongitude: number;
    GPSAltitude: number;
    ExifImageWidth: number;
    ExifImageHeight: number;
    gimbalRollDegree: number,
    gimbalYawDegree: number,
    gimbalPitchDegree: number,
    flightRollDegree: number,
    flightYawDegree: number,
    flightPitchDegree: number
    // ImageDescription?: string;
    // SerialNumber?: string;
    // InteropIndex?: string;
    // Orientation: number;
    // XResolution: number;
    // YResolution: number;
    // ResolutionUnit: number;
    // Software?: string;
    // YCbCrPosition: number;
    // GPSVersionId: [number, number, number, number];
    // ExposureTime?: number;
    // ExposureProgram?: number;
    // ExposureCompensation?: number;
    // ExposureIndex?: string;
    // ExposureMode?: number;
    // FNumber?: number;
    // ISO?: number;
    // CompressedBitPerPixel?: number;
    // ShutterSpeedValue?: number;
    // ApertureValue?: number;
    // MaxApertureValue?: number;
    // SubjectDistance?: number;
    // SubjectDistanceRange?: number;
    // MeteringMode?: number;
    // LightSource?: number;
    // Flash?: number;
    // FocalLength?: number;
    // FocalLengthIn35mmFormat?: number;
    // ColorSpace?: number;
    // CustumRendered?: number;
    // WhiteBalance?: number;
    // DigitalZoomRatio?: string;
    // SceneCaptureType?: number;
    // GainControl?: number;
    // Contrast?: number;
    // Saturation?: number;
    // Sharpness?: number;
}
