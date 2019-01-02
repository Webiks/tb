export interface IFileData {
    _id?: string;
    name: string;
    size: number;
    lastModified?: number;
    fileCreatedDate?: Date | string;
    fileUploadDate?: Date | string;
    fileExtension: string,
    fileType: string,
    format: string;                  // ['GEOTIFF', 'SHAPEFILE', 'JPEG']
    filePath?: string,
    encodeFileName?: string,
    zipPath?: string
}

