import * as React from 'react';

import config from "../../config/config";
import { connect } from "react-redux";
import * as _ from 'lodash';
import { IState } from "../../store";
import { IWorld } from "../../interfaces/IWorld";
import { ITBAction } from '../../consts/action-types';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
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

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IFileData {
    name: string,
    size: number,
    // path: string,
    // type: string,
    // mtime: Date
}

export interface IStateWorld {
    hideSpinner: boolean
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    layersId: string[] = this.props.world.layersId ? this.props.world.layersId : [];
    state: IStateWorld = { hideSpinner: true };
    url: string = `${config.baseUrl.path}/${config.baseUrl.api}/upload/${this.props.world.workspaceName}`;
    fileList: IFileData[];

    onUpload = (e: any) => {
        console.log("On Upload...");
        // get the list of the upload files with the name and size
        this.fileList = this.getFilesData(JSON.parse(e.xhr.response));
        this.getNewLayersData();
    };

    getFilesData(files: any): IFileData[] {
        let filesData: IFileData | IFileData[];
        // if Vector - take only the .SHP file data
        if (Array.isArray(files)){
            if (files[0].type === 'application/octet-stream'){
                filesData = files.find( file => file.name.split('.')[1] === 'shp');
                return [this.getFileData(filesData)];
            } else {
                return files.map( file => this.getFileData(file));
            }
        } else {
            return [this.getFileData(files)];
        }
    }

    // get only the name and the size of the upload file
    getFileData(file: any): IFileData {
        return {
            name: file.name,
            size: file.size
        }
    }

    getNewLayersData = () => {
        this.setState({ hideSpinner: false } );
        console.log("getNewLayersData...");
        // 1. get an Array of all the world's layers from the GeoServer
        LayerService.getWorldLayersFromGeoserver(this.props.world.workspaceName)
            .then ( ( geolayers: IWorldLayer[]) => {
                console.log("app layers length: "  + this.props.world.layers.length);
                console.log("geo layers length: "  + geolayers.length);
                // check if there is a difference between the App Store layers's list to the GeoServer layers's list
                const diffLayers = ( this.props.world.layers.length && this.props.world.layers[0] !== null )
                    ? _.differenceWith(geolayers, this.props.world.layers,
                    (geoLayer: IWorldLayer, appLayer: IWorldLayer) => geoLayer.name === appLayer.name)
                    : geolayers;
                console.log("diff layers length: " + diffLayers.length);
                return diffLayers;
            })
            // 2. get all the layers data from GeoServer (by a giving layers's list)
            .then ( ( diffLayers : IWorldLayer[]) => {
                LayerService.getAllLayersData(this.props.world.workspaceName, diffLayers)
                    .then(( layers: IWorldLayer[] ): Promise<any> => {
                        console.log("getLayersDataByList getInputData...");
                        // set the final layers list and save it in the DataBase
                        const promises = layers.map((layer: IWorldLayer) => {
                            // set the inputData to be EMPTY for the new layer
                            layer.inputData = this.setInitInputData(layer);
                            // add the name and the size of the file to the match layer (IImageData)
                            const matchLayer = this.fileList.find( file => file.name === layer.layer.fileName);
                            layer.imageData = this.setInitImageData(matchLayer);
                            // 3. Save the new layer in the DataBase and get its _id
                            return LayerService.createLayer({...layer})
                                .then( dbLayer => {
                                    console.warn("CREATE new layer in MongoDB id: " + dbLayer._id);
                                    // update the layer with its Id in the DataBase
                                    layer._id = dbLayer._id;
                                    // update the world's layersId with the new Id
                                    this.layersId.push(dbLayer._id);
                                    console.log("world layersId: " + JSON.stringify(this.layersId));
                                    return layer;
                                })
                                .catch( error => this.handleError('Failed to save the layer in MongoDB: ' + error));
                        });
                        return Promise.all(promises);
                    })
                    .then ( ( layersList: IWorldLayer[] ) => {
                        // 4. update the App Store with the new layer
                        const newLayers = [...this.props.world.layers, ...layersList];
                        console.log("getLayersDataByList refreshing...");
                        this.refresh(this.layersId, newLayers);
                    })
                    .catch(error => this.handleError("UPLOAD: getAllLayersData ERROR: " + error));
            })
            .catch(error => this.handleError("UPLOAD: getWorldLayersFromGeoserver ERROR: " + error));
    };

    // get the input Data of the layer from the App store
    setInitInputData = (layer: IWorldLayer): any => {
        console.log("getInputData...");
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

    // get the input Data of the layer from the App store
    setInitImageData = (file: IFileData): IImageData => {
        console.log("getImageData...");
        const date = new Date('2018-01-01');

        return {
            file: {
                name: file.name,
                size: file.size,
                dateCreated: null,
                dateModified: null,
                // type: '',                           // TIF or SHX
                // folderPath: '',
                // attribute: ''
            },
            // image: {
            //     width: 0,                          // pixels
            //     height: 0,                         // pixels
            //     horizontalResolution:0,            // dpi
            //     verticalResolution: 0,             // dpi
            //     bitDepth: 0,
            //     compression: ''
            // },
            // photo: {
            //     photometricInterpretation: ''       // RGB
            // }
        };
    };

    // update the App store and refresh the page
    refresh = (layersId: string[], layers: IWorldLayer[]) => {
        console.log('Upload File: REFRESH...');
        const name = this.props.worldName;
        this.props.updateWorld({ name, layersId, layers });
        this.setState({ hideSpinner: true } );
    };

    handleError = (message) => {
        console.error(message);
        return this.refresh(this.layersId, this.props.world.layers);
    };

    onError = (e: any) => {
        console.log("upload error: " + e.data);
    };

    render() {
        return (
            <div>
                <div className="content-section implementation">
                    <FileUpload mode="advanced" name="uploads" multiple={true} url={this.url}
                                accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg, .zip"
                                maxFileSize={config.maxFileSize} auto={false}
                                chooseLabel="Choose"
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