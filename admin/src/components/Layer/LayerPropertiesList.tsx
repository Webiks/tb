export interface IPropertiesList {
    label: string,
    path: string,
    readonly : boolean,
    type?: string,
    min?: number
}

const LayerPropertiesList: IPropertiesList[] = [
    { label: 'World Name', path: 'worldName', readonly: true },
    { label: 'File Name', path: 'worldLayer.layer.name', readonly: false, type: 'text'},
    { label: 'File Type', path: 'worldLayer.layer.type', readonly: true },
    { label: 'Folder Path', path: 'worldLayer.layer.filePath', readonly: true },
    { label: 'Image Date Taken', path: '', readonly: true },
    { label: 'Image Last Modified', path: '', readonly: true },
    { label: 'GPS (center point)', path:'worldLayer.data.center' , readonly: true },
    { label: 'Zoom Level', path: 'worldLayer.inputData.zoom', readonly: false, type: 'number', min: 1},
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

