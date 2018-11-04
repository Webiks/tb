export interface IPropertiesList {
    label: string,
    path: string,
    readonly : boolean,
    type?: string,
    min?: number
}

const LayerPropertiesList: IPropertiesList[] = [
    { label: 'World Name', path: 'worldName', readonly: true },
    { label: 'File Name', path: 'worldLayer.inputData.fileName', readonly: false, type: 'text'},
    { label: 'File Type', path: 'worldLayer.fileType', readonly: true },
    { label: 'File Size(KB)', path:'worldLayer.fileData.size' , readonly: true },
    { label: 'Folder Path', path: 'worldLayer.filePath', readonly: true },
    { label: 'Layer Date Upload', path: 'worldLayer.fileData.fileUploadDate', type: 'date', readonly: true },
    { label: 'File Date Modified', path: 'worldLayer.fileData.fileCreatedDate', type: 'date', readonly: true },
    { label: 'GPS (center point)', path:'worldLayer.geoData.centerPoint' , readonly: true },
    { label: 'GSD (cm)', path: 'worldLayer.inputData.GSD', readonly: false, type: 'number', min: 0},
    { label: 'Cloud Coverage (%)', path: 'worldLayer.inputData.cloudCoveragePercentage', readonly: false, type: 'number', min: 0},
    { label: 'Sensor Maker', path: 'worldLayer.inputData.sensor.maker', readonly: false, type: 'text'},
    { label: 'Sensor Name', path: 'worldLayer.inputData.sensor.name', readonly: false, type: 'text'},
    { label: 'Sensor Band 1', path: 'worldLayer.inputData.sensor.bands[0]', readonly: false, type: 'text'},
    { label: 'Sensor Band 2', path: 'worldLayer.inputData.sensor.bands[1]', readonly: false, type: 'text'},
    { label: 'Sensor Band 3', path: 'worldLayer.inputData.sensor.bands[2]', readonly: false, type: 'text'},
    { label: 'Sensor Band 4', path: 'worldLayer.inputData.sensor.bands[3]', readonly: false, type: 'text'},
    { label: 'File Affiliation', path: 'worldLayer.inputData.affiliation', readonly: false, type: 'dropdown'}
];

export default LayerPropertiesList;

