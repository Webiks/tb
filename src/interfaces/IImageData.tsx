export interface IImageData {
    // imageName: string;                                      // the original image file name
    ImageDescription: string;
    Make: string;
    Model: string;
    SerialNumber: string;
    InteropIndex: string;
    Software: string;
    ExifImageWidth: number; 								// the picture size in pixels
    ExifImageHeight: number;								// the picture size in pixels
    Orientation: number;
    XResolution: number; 							    	// resolution
    YResolution: number; 								    // resolution
    ResolutionUnit: number; 								// resolution
    ModifyDate: number; 									// modified date
    DateTimeOriginal: number; 								// original date
    CreatedDate: number; 									// created date
    JPGModifiedDate: Date | string;
    JPGOriginalDate: Date | string;
    YCbCrPosition: number;
    XPComment: number[];
    XPKeywords: number[];
    GPSVersionId: number[];
    GPSLatitudeRef: string; 								// x-point orientation (latitude)
    GPSLatitude: number;									// x-point (latitude)
    GPSLongitudeRef: string;								// y-point orientation (longitude)
    GPSLongitude: number;									// y-point (longitude)
    GPSAltitude: number;									// relative altitude
    ExposureTime: number;
    ExposureProgram: number;
    ExposureCompensation: number;
    ExposureIndex: string;
    ExposureMode: number;
    FNumber: number;
    ISO: number;
    CompressedBitPerPixel: number;
    ShutterSpeedValue: number;
    ApertureValue: number;
    MaxApertureValue: number;
    SubjectDistance: number;
    SubjectDistanceRange: number;
    MeteringMode: number;
    LightSource: number;
    Flash: number;
    FocalLength: number;
    FocalLengthIn35mmFormat: number;
    ColorSpace: number;
    CustumRendered: number;
    WhiteBalance: number;
    DigitalZoomRatio: string;
    SceneCaptureType: number;
    GainControl: number;
    Contrast: number;
    Saturation: number;
    Sharpness: number
}