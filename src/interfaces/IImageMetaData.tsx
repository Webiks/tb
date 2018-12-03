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
    relativeAltitude: number;
    ExifImageWidth: number;
    ExifImageHeight: number;
    pitch: number,
    yaw: number,
    roll: number,
    cameraPitch: number,
    cameraYaw: number,
    cameraRoll: number,
    gimbalRollDegree: number,
    gimbalYawDegree: number,
    gimbalPitchDegree: number,
    flightRollDegree: number,
    flightYawDegree: number,
    flightPitchDegree: number,
    camReverse: number,
    gimbalReverse: number,
    fieldOfView: number,
    thumbnailUrl: string
}
