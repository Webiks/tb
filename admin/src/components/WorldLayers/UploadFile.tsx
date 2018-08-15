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
    mtime: Date;
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
    filesList: IFileData[] = [];

    onSelect = (e: { files: FileList }) => {
        console.log('On Select...');
        // get a list of the e.files (change File Objects to an Array)
        const uploadFiles: IFileData[] = Array.from(e.files).map((file: File): IFileData => {
            const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
            return {
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                fileCreatedDate: new Date(file.lastModified).toISOString(),
                fileExtension
            }
        });
        // create the FilesList
        uploadFiles.map( ( file: IFileData ) => {
            // check the file name
            const extension = file.fileExtension.toLowerCase();
            if (extension === '.tif' || extension === '.tiff' || extension === '.shp'){
                console.log("onSelect file : " + JSON.stringify(file));
                if (this.props.world.layers.length > 0){
                    const name = file.name.split('.')[0];
                    console.log("name: " + name);
                    if (!this.isNameExist(name)){
                        console.log("this file name is OK!");
                        this.filesList.push(file);
                        console.log("filesList: " + JSON.stringify(this.filesList));
                    } else {
                        this.showError(`the '${name}' file is alredy exist! please remove it!`);
                    }
                } else {
                    this.filesList.push(file);
                }
            }
        });
    };

    onUpload = (e: any) => {
        console.log('On Upload...');
        // get the list of the upload files
        let parsingRes: IReqFile[] = JSON.parse(e.xhr.response);
        parsingRes = Array.isArray(parsingRes) ? parsingRes : [parsingRes];
        this.updateFilesList(parsingRes);
        this.getNewLayersData();
    };

    isNameExist = (name: string): any => {
        // check if the name exists in the layers list or in the DataBase (the store name)
        const layer = this.props.world.layers.find(layer => layer.store.name === name);
        // return (this.props.world.layers.find(layer => layer.store.name === name));
        return layer;
    };

    // createFileList = ( file: IFileData ) => {
    //     // if it a Tiff or a Shapefile - add the file to the fileList
    //     console.log("start to create fileList...");
    //     const extension = file.fileExtension.toLowerCase();
    //     if (extension === '.tif' || extension === '.tiff' || extension === '.shp'){
    //         console.log("extension: " + extension);
    //         this.filesList.push(file);
    //     }
    // };

    updateFilesList = (reqFiles: IReqFile[])=> {
        reqFiles.map((reqFile: IReqFile) => {
            // find the match layer
            const extension = reqFile.name.substring(reqFile.name.lastIndexOf('.'));
            if (extension === '.tif' || extension === '.tiff' || extension === '.shp'){
                console.log("reqFile name: " + reqFile.name);
                const file = this.filesList.find( (file: IFileData) => file.name === reqFile.name);
                const layerIndex = this.filesList.indexOf(file);
                console.log("updateFilesList layerIndex: " + layerIndex);
                // update the file fields (path and fileUploadDate)
                this.filesList[layerIndex].fileUploadDate = new Date(reqFile.mtime).toISOString();
                console.log(`layer list[${layerIndex}]: ${JSON.stringify(this.filesList[layerIndex])}`);
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
                        // set the final layers list and save it in the DataBase
                        const promises = layers.map((layer: IWorldLayer) => {
                            const newLayer = this.getOtherLayerData(layer);
                            return this.createLayer(newLayer);
                        });
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
        // set the inputData to be EMPTY for the new layer
        layer.inputData = this.setInitInputData(layer);
        // set the fileData field with the upload layer data
        layer.fileData = this.setFileData(this.filesList.find(file => file.name === layer.fileName));
        // layer.fileData = this.filesList.find(file => file.name === layer.layer.fileName);
        console.log("uploadFile fileData: " + JSON.stringify(layer.fileData));
        // layer.fileData = this.setFileData(uploadLayer);
        // layer.imageData = this.getImageData(uploadLayer);
        return { ...layer };
    };

    // get the input Data of the layer from the App store
    setInitInputData = (layer: IWorldLayer): any => {
        console.log('getInputData...');
        return {
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
    setFileData = (layer: IFileData): any => {
        console.log('getFileData...', layer.name);
        return {
            name: layer.name,
            size: layer.size,
            // type: layer.type,
            lastModified: layer.lastModified,
            fileCreatedDate: layer.fileCreatedDate,
            fileUploadDate: layer.fileUploadDate,
            fileExtension: layer.fileExtension
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
                                accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg, .zip"
                                maxFileSize={config.maxFileSize} auto={false}
                                chooseLabel="Choose"
                                onSelect={this.onSelect}
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