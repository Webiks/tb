import * as React from 'react';

import config from '../../config/config';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { ITBAction } from '../../consts/action-types';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { IFileData } from '../../interfaces/IFileData';
import { IImageData } from '../../interfaces/IImageData';
import { LayerService } from '../../services/LayerService';
import { WorldsActions } from '../../actions/world.actions';
import { FileUpload } from 'primereact/components/fileupload/FileUpload';
import { AFFILIATION_TYPES } from '../../consts/layer-types';

/* Prime React components */
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { ProgressSpinner } from 'primereact/components/progressspinner/ProgressSpinner';
import { Growl } from 'primereact/components/growl/Growl';
import { IInputdata } from '../../interfaces/IInputData';
import Layer from '../Layer/Layer';

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IReqFile {
    name: string;
    size: number;
    type: string;
    path: string;
    mtime: Date | string;
    fileType: string;
    filePath: string;
    encodeFileName: string;
    encodePathName: string;
    splitPath: string;
}

export interface IStateWorld {
    hideSpinner: boolean
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    layersId: string[] = this.props.world.layersId ? this.props.world.layersId : [];
    state: IStateWorld = { hideSpinner: true };
    url: string = `${config.baseUrl}/api/upload/${this.props.world.workspaceName}`;
    growl: any;
    uploadFiles: IFileData[];

    onSelect = (e: any)  => {
        console.log('On Select...');
        // debugger;
        let fileType: string;
        this.uploadFiles = [];
        // get a list of the e.files (change Files Object to an Array)
        const selectedFiles: IFileData[] = Array.from(e.files).map((file: File): IFileData => {
            // find the file Extension and Type
            const fileExtension = this.getExtension(file.name);
            if (fileExtension.toLowerCase().includes('tif')){
                fileType = 'raster'
            } else {
                fileType = 'vector'
            }
            return {
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                fileCreatedDate: new Date(file.lastModified).toISOString(),
                fileExtension,
                fileType
            }
        });
        console.log(`selectedFiles Length: ${selectedFiles.length}`);
        // Check the Validation of the files
        // of MULTI-FILES
        if (selectedFiles.length > 1){
            // 1. RASTERS - check that don't mix Raster's files with Vector's files
            let countRasters: number = 0;
            selectedFiles.forEach( ( file: IFileData ) => {
                if (file.fileType === 'raster'){
                    countRasters++;
                }
            });
            console.log("countRasters = " + countRasters);

            if (countRasters > 0){
                if (countRasters !== selectedFiles.length){
                    this.showError("Can't upload rasters and vectors files together!");
                } else {
                    // add the files to the Files List
                    selectedFiles.map( ( raster: IFileData ) => this.uploadFiles.push(raster));
                }
            }
            // 2. for VECTORS only
            else {
                // A. check that the mandatory files: .SHP exist
                if (this.isShpExist(selectedFiles)){
                    // B. check if all the Vector's files names are the same
                    const vectorName = selectedFiles[0].name.split('.')[0];
                    if (this.isNameDiffer(selectedFiles, vectorName)){
                        this.showError("all the Vector's files must have the same name!");
                    } else {
                        // add the files to the Files List
                        selectedFiles.map( ( file: IFileData ) : any => this.uploadFiles.push(file));
                    }
                }
            }
        }
        // of a SINGLE file
        else {
            // if Vector - must have a .SHP file
            if (selectedFiles[0].fileType === 'vector') {
                // check that the mandatory file: .SHP exist
                if (this.isShpExist(selectedFiles)){
                    // add the file to the Files List
                    this.uploadFiles.push(selectedFiles[0]);
                }
            }
        }
        // console.log("filesList(before check the name): " + JSON.stringify(this.uploadFiles));
        console.log(`uploadFiles Length(before check the files): ${this.uploadFiles.length}`);

        // 3. check the file name (of the the valid files) to prevent duplicate names
        // check only if the file list is not empty
        if (this.uploadFiles.length > 0){
            // check only if there are any layers in the world
            if (this.props.world.layers.length > 0){
                let selectedFileList: IFileData[];
                if (fileType === 'raster') {
                    selectedFileList = this.uploadFiles;
                } else {
                    // VECTORS - all the files are with the same name (check only the first file)
                    selectedFileList = [this.uploadFiles[0]];
                }
                console.log(`selectedFileList Length(before check the name): ${selectedFileList.length}`);
                selectedFileList.map( ( file: IFileData ) => {
                    const name = this.getFileName(file.name);
                    console.log("raster name: " + name);
                    // 1. check if the name is already exist
                    if (this.isNameExist(name)){
                        // remove the file from the file list
                        this.uploadFiles.splice(this.findFileIndex(name), 1);
                        this.showError(`the '${name}' file is alredy exist! please remove it or change its name!`);
                    }
                    // 2. check that there are no special characters in the name
                    else if (this.checkForSpecialChar(name)) {
                        // remove the file from the file list
                        this.uploadFiles.splice(this.findFileIndex(name), 1);
                        this.showError(`one or more special characters was found! please, fix the file name!`);
                    }
                    else {
                        console.log("this file name is OK!");
                    }
                });
                console.log(`uploadFiles Length(after check the name): ${this.uploadFiles.length}`);
            }
        }
        console.log(`uploadFiles Length(after check the name): ${this.uploadFiles.length}`);
    };

    onBeforeUpload = (e: any): any => {
        console.log('On Before Upload...');
        e.returnValue = this.uploadFiles;
        console.log('On Before Upload returnValue: ' + JSON.stringify(e.returnValue));
        return e.returnValue;
        // if (this.uploadFiles.length === 0){
        //     this.showError(`your files where removed! please choose again`);
        //     e.preventDefault();
        // } else {
        //     console.log('On Before Upload returnValue: ' + JSON.stringify(this.uploadFiles));
        //     e.returnValue = this.uploadFiles;
        // }
    };

    onUpload = (e: any) => {
        console.log('On Upload...');
        // get the list of the upload files
        let parsingRes: IReqFile[] = JSON.parse(e.xhr.response);
        parsingRes = Array.isArray(parsingRes) ? parsingRes : [parsingRes];
        console.log('upload response: ' + parsingRes);
        if (parsingRes.length === 0){
            this.setState({ hideSpinner: true });
            this.showError("the upload was a failure!");
        } else {
            this.updateFilesList(parsingRes);
            console.log("onUpload: " +  JSON.stringify(this.uploadFiles));
            this.getNewLayersData();
        }
    };

    // get the name of the file (without the extension)
    getFileName = (name: string): any => name.split('.')[0];

    // get the extension of the file (include the point)
    getExtension = (name: string): any => name.substring(name.lastIndexOf('.'));

    // check if tne name contain special characters
    checkForSpecialChar = (name: string): boolean => {
        console.warn("checkForSpecialChar...");
        const specialChars  = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;
        console.warn(`checkForSpecialChar result: ${specialChars.test(name)}`);
        return specialChars.test(name);
    };

    // check if the name exists in the layers list or in the DataBase (the store name)
    isNameExist = (name: string): any => this.props.world.layers.find(layer =>
        (this.getFileName(layer.fileData.name) === name || this.getFileName(layer.inputData.fileName) === name));

    // in VECTORS - check if there is a different name among all the Vector's files
    isNameDiffer = (fileList: IFileData[], name) : any =>
                    fileList.find( ( file: IFileData ): any => file.name.split('.')[0] !== name);

    // in VECTORS - check if the .SHP file exist in the file list
    isShpExist = (fileList: IFileData[]): boolean => {
        if (this.isExtensionExist(fileList,'.shp')){
            return true;
        } else {
            this.showError("can't upload Vector without a .SHP file!");
            return false;
        }
    };

    isExtensionExist = (fileList: IFileData[], ext: string): any =>
                        fileList.find( (file: IFileData): boolean => file.fileExtension.toLowerCase() === ext);

    findFileIndex = (name: string): number => {
        const file = this.uploadFiles.find( (file: IFileData) => file.name === name);
        return this.uploadFiles.indexOf(file);
    };

    updateFilesList = (reqFiles: IReqFile[]) => {
        reqFiles.map((reqFile: IReqFile) => {
            // find the match layer
            console.log("updateFilesList reqFile: " + JSON.stringify(reqFile));
            const extension = this.getExtension(reqFile.name);
            if (extension.toLowerCase().includes('tif') || extension === '.shp'){
                console.log("reqFile name: " + reqFile.name);
                const layerIndex = this.findFileIndex(reqFile.name);
                console.log("updateFilesList layerIndex: " + layerIndex);
                // update the file new fields
                this.uploadFiles[layerIndex].fileUploadDate = reqFile.mtime;
                this.uploadFiles[layerIndex].filePath = reqFile.filePath;
                this.uploadFiles[layerIndex].encodeFileName = reqFile.encodeFileName;
                this.uploadFiles[layerIndex].encodePathName = reqFile.encodePathName;
                this.uploadFiles[layerIndex].splitPath = reqFile.splitPath;
                console.log(`updateFilesList File list[${layerIndex}]: ${JSON.stringify(this.uploadFiles[layerIndex])}`);
            }
        });
    };

    getNewLayersList = (geolayers: IWorldLayer[]): IWorldLayer[] => {
        console.log('app layers length: ' + this.props.world.layers.length);
        console.log('geo layers length: ' + geolayers.length);
        // check if there is a difference between the App Store layers's list to the GeoServer layers's list
        const newLayers = (this.props.world.layers.length && this.props.world.layers[0] !== null)
            ? _.differenceWith(geolayers, this.props.world.layers,
                (geoLayer: IWorldLayer, appLayer: IWorldLayer) => geoLayer.name === appLayer.name)
            : geolayers;
        console.log('diff layers length: ' + newLayers.length);
        return newLayers;
    };

    getNewLayersData = () => {
        this.setState({ hideSpinner: false });
        console.log('getNewLayersData...');
        // 1. get an Array of all the world's layers from the GeoServer
        LayerService.getWorldLayersFromGeoserver(this.props.world.workspaceName)
            .then((geolayers: IWorldLayer[]) => this.getNewLayersList(geolayers))
            // 2. get all the layers data from GeoServer (only for the new upload files)
            .then((newLayers: IWorldLayer[]) => {
                LayerService.getAllLayersData(this.props.world.workspaceName, newLayers)
                    .then((layers: IWorldLayer[]): Promise<any> => {
                        // 3. set the final layers list and save it in the DataBase
                        const promises = layers.map((layer: IWorldLayer) =>
                                                    this.createLayer(this.getOtherLayerData(layer)));
                        return Promise.all(promises);
                    })
                    .then((layersList: IWorldLayer[]) => {
                        // 4. update the App Store with the new layer
                        const newLayers = [...this.props.world.layers, ...layersList];
                        console.log('getLayersDataByList refreshing...');
                        this.refresh(this.layersId, newLayers);
                    })
                    .catch(error => this.handleError('UPLOAD: getAllLayersData ERROR: ' + error));
            })
            .catch(error => this.handleError('UPLOAD: getWorldLayersFromGeoserver ERROR: ' + error));
    };

    // get other data of the layer
    getOtherLayerData = (layer: IWorldLayer): IWorldLayer => {
        // set the fileData field with the upload layer data
        console.log("layer name: " + layer.fileName);
        console.log("encode name: " + this.uploadFiles[0].encodeFileName);
        const currentFile = this.uploadFiles.find(file => file.encodeFileName === layer.fileName);
        layer.fileData = this.setFileData(currentFile);
        // set the inputData to be EMPTY for the new layer
        layer.inputData = this.setInitInputData(layer);
        console.log("uploadFile fileData: " + JSON.stringify(layer.fileData));
        // layer.imageData = this.getImageData(uploadLayer);
        return { ...layer };
    };

    // get the Image Data of the layer from the App store
    setFileData = (file: IFileData): any => {
        console.log('getFileData...', file.name);
        return {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified,
            fileCreatedDate: file.fileCreatedDate,
            fileUploadDate: file.fileUploadDate,
            fileExtension: file.fileExtension,
            fileType: file.fileType,
            filePath: file.filePath,
            encodeFileName: file.encodeFileName,
            encodePathName: file.encodePathName,
            splitPath: file.splitPath
        };
    };

    // get the input Data of the layer from the App store
    setInitInputData = (layer: IWorldLayer): IInputdata => {
        console.log('setInitInputData...' + layer.name);
        return {
            fileName: layer.fileData.name,
            affiliation: AFFILIATION_TYPES.AFFILIATION_UNKNOWN,
            GSD: 0,
            sensor: {
                maker: '',
                name: '',
                bands: []
            },
            flightAltitude: 0,
            cloudCoveragePercentage: 0,
            zoom: 14,
            opacity: 0.6
        };
    };

    // get the Image Data of the layer from the App store
    // getImageData = (file: IFileData): IImageData => {
    //     console.log('getImageData...', file);    //
    //     return {
    //         image: {
    //             width: 0,                          // pixels
    //             height: 0,                         // pixels
    //             horizontalResolution:0,            // dpi
    //             verticalResolution: 0,             // dpi
    //             bitDepth: 0,
    //             compression: ''
    //         },
    //         photo: {
    //             photometricInterpretation: ''       // RGB
    //         }
    //     };
    // };

    // create new layer in the DataBase and update its _id in the world layersId list
    createLayer = (newLayer: IWorldLayer): Promise<any> => {
        return LayerService.createLayer(newLayer)
            .then(dbLayer => {
                console.warn('CREATE new layer in MongoDB id: ' + dbLayer._id);
                // update the layer with its Id in the DataBase
                newLayer._id = dbLayer._id;
                // update the world's layersId with the new Id
                this.layersId.push(dbLayer._id);
                return newLayer;
            })
            .catch(error => this.handleError('Failed to save the layer in MongoDB: ' + error));
    };

    // update the App store and refresh the page
    refresh = (layersId: string[], layers: IWorldLayer[]) => {
        console.log('Upload File: REFRESH...');
        const name = this.props.worldName;
        this.props.updateWorld({ name, layersId, layers });
        this.setState({ hideSpinner: true });
    };

    // an ERROR massage - if the suggested world's name is already exists
    showError(message) {
        this.growl.show({
            severity: 'error', summary: 'Error Message', life: 8000,
            detail: message
        });
    }

    onError = (e: any) => {
        this.handleError(e.data);
    };

    handleError = (message) => {
        console.error(message);
        return this.refresh(this.layersId, this.props.world.layers);
    };

    render() {
        return (
            <div>
                <div className="content-section implementation ui-fluid">
                    <Growl ref={(el) => this.growl = el} position="bottomleft"/>
                </div>

                <div className="content-section implementation">
                    <FileUpload mode="advanced" name="uploads" multiple={true} url={this.url}
                                accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg"
                                maxFileSize={config.maxFileSize} auto={false}
                                chooseLabel="Choose File (no zip)"
                                onSelect={this.onSelect}
                                onBeforeUpload={this.onBeforeUpload}
                                onProgress={() => this.setState({ hideSpinner: false })}
                                onUpload={this.onUpload}/>
                </div>
                <div hidden={this.state.hideSpinner}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="#EEEEEE"
                                     animationDuration=".5s"/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: IState, { worldName }: any) => {
    return {
        worldName,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadFile);