export interface IImageData {
    ImageDescription: string;
    Make: string;
    Model: string;
    ModifyDate: number; 									// modified date
    DateTimeOriginal: number; 								// original date
    CreatedDate: number; 									// created date
    JPGModifiedDate: Date | string;
    JPGOriginalDate: Date | string;
    GPSLatitudeRef: string; 								// x-point orientation (latitude)
    GPSLatitude: number;									// x-point (latitude)
    GPSLongitudeRef: string;								// y-point orientation (longitude)
    GPSLongitude: number;									// y-point (longitude)
    GPSAltitude: number;									// relative altitude
    ExifImageWidth: number; 								// the picture size in pixels
    ExifImageHeight: number;								// the picture size in pixels
    // SerialNumber: string;
    // InteropIndex: string;
    // Software: string;
    // Orientation: number;
    // XResolution: number; 							  	// resolution
    // YResolution: number; 							    // resolution
    // ResolutionUnit: number; 								// resolution
    // YCbCrPosition: number;
    // GPSVersionId: number[];
    // ExposureTime: number;
    // ExposureProgram: number;
    // ExposureCompensation: number;
    // ExposureIndex: string;
    // ExposureMode: number;
    // FNumber: number;
    // ISO: number;
    // CompressedBitPerPixel: number;
    // ShutterSpeedValue: number;
    // ApertureValue: number;
    // MaxApertureValue: number;
    // SubjectDistance: number;
    // SubjectDistanceRange: number;
    // MeteringMode: number;
    // LightSource: number;
    // Flash: number;
    // FocalLength: number;
    // FocalLengthIn35mmFormat: number;
    // ColorSpace: number;
    // CustumRendered: number;
    // WhiteBalance: number;
    // DigitalZoomRatio: string;
    // SceneCaptureType: number;
    // GainControl: number;
    // Contrast: number;
    // Saturation: number;
    // Sharpness: number
}