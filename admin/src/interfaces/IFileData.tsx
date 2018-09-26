import { ISelectedFile } from './ISelectedFile';

export interface IFileData {
    name: string;
    size: number;
    lastModified: number;
    fileCreatedDate?: Date | string;
    fileUploadDate?: Date | string;
    fileExtension: string,
    fileType: string,
    filePath?: string,
    encodeFileName?: string,
    encodePathName?: string,
    splitPath?: string
}

