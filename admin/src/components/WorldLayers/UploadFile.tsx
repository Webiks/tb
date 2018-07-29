import * as React from 'react';

import config from "../../config/config";
import { connect } from "react-redux";
import * as _ from 'lodash';
import { IState } from "../../store";
import { IWorld } from "../../interfaces/IWorld";
import { ITBAction } from '../../consts/action-types';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { WorldService } from '../../services/WorldService';
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
    getAllLayersData: () => void,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IFileData {
    size: number,
    path: string,
    name: string,
    type: string,
    mtime: Date
}

export interface IStateWorld {
    // layers: IWorldLayer[],
    hideSpinner: boolean
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    state: IStateWorld =
        {
            // layers: this.props.world.layers,
            hideSpinner: true
        };
    url: string = `${config.baseUrl.path}/${config.baseUrl.api}/upload/${this.props.worldName}`;

    onUpload = (e: any) => {
        console.log("On Upload...");
        // this.setState({ hideSpinner: false } );
        this.getNewLayersData();
        // get the list of upload files
        // let reqFiles: IFileData[] | any  = JSON.parse(e.xhr.response);
        // if (!reqFiles.length){
        //     reqFiles = [reqFiles];
        // }
        // get all the data of the new files
        // const promises = reqFiles.map( file => {
        //     const name = (file.name).split('.')[0];
        //     // get all the data of the new files from GeoServer
        //     LayerService.getLayerByName(this.props.worldName, name)
        //         .then ( layer => {
        //             layer.name = name;
        //             layer.worldName = this.props.worldName;
        //             layer.worldLayerId = `${this.props.worldName}:${name}`;
        //             const layers = [...this.state.layers, layer];
        //             // update the State layers
        //             this.setState({ layers });
        //             return layers;
        //         })
        //         .catch(error => {
        //             console.error ('Upload file: getLayerByName ' + name + ' Error: ' + error);
        //             return this.state.layers;
        //         })
        // });

        // Promise.all(promises)
        //     .then ( (layers: any) => {
        //         console.log("upload file: promises(layers): " + JSON.stringify(layers));
        //         // update the App Store
        //         this.refresh(layers);
        //         // update the world's layers in the Database
        //         WorldService.updateWorldField(this.props.world, 'layers', layers)
        //             .then ( res =>
        //                                 console.warn('Succeed to update the layers: ' + JSON.stringify(res)))
        //             .catch( error => console.error('Failed to update the world layers: ' + JSON.stringify(error)));
        //     })
    };

    getNewLayersData = () => {
        this.setState({ hideSpinner: false } );
        console.log("getAllLayersData...");
        // A. get an Array of all the world's layers
        LayerService.getWorldLayers(this.props.world.name)
            .then ( ( layersList: IWorldLayer[]) => {
                console.log("app layers: " + JSON.stringify(this.props.world.layers) + this.props.world.layers.length);
                console.log("geo layers: " + JSON.stringify(layersList));
                // check if there is a difference between the App Store layers's list to the GeoServer layers's list
                const diffLayers = ( this.props.world.layers.length && this.props.world.layers[0] !== null )
                    ? _.differenceWith(layersList, this.props.world.layers,
                    (geoLayer: IWorldLayer, appLayer: IWorldLayer) => geoLayer.layer.name === appLayer.layer.name)
                    : layersList;
                console.log("diff layers: " + diffLayers);
                return diffLayers;
            })
            // B. get all the layers data (by a giving layers's list)
            .then ( ( layersList : any) => {
                console.log("new files list: " + JSON.stringify(layersList));
                LayerService.getLayersDataByList(this.props.world.name, layersList)
                    .then(layers => {
                        console.log("getAllLayersData getInputData..." + JSON.stringify(layers[0]));
                        // set the final layers list and save it in the DataBase
                        const layersList = layers.map((layer: IWorldLayer) => {
                            // 1. set the inputData to be EMPTY for the new layer
                            layer.inputData = this.setInitInputData(layer);
                            console.warn("after getInputData: " + JSON.stringify(layer));
                            return layer;
                            // 2. create and save the new worldLayer Model in the DataBase
                            // LayerService.createWorldLayer(layer)
                            //     .then( response => {
                            //         // 3. update the new layer Model inside the World's layers field
                            //         WorldService.updateWorldField(this.props.world, 'layers', layer)
                            //             .then ( res => {
                            //                 console.warn('Succeed to update the world layers field: ' + JSON.stringify(res));
                            //                 return layer;
                            //             })
                            //             .catch( error => {
                            //                 console.error('UPLOAD: Failed to update the world layers field: ' + JSON.stringify(error));
                            //                 return error;
                            //             });
                                // })
                                // .catch(error => console.error("UPLOAD: createWorldLayer ERROR: " + error));
                        });
                        // update the App store
                        const newLayers = [...this.props.world.layers, ...layersList];
                        console.log("getAllLayersData refreshing..." + newLayers);
                        this.refresh(newLayers);
                        // update the World with the new layers in the Database
                        WorldService.updateWorldField(this.props.world, 'layers', newLayers)
                            .then ( res =>
                                                console.warn('Succeed to update the layers: ' + JSON.stringify(res)))
                            .catch( error => console.error('Failed to update the world layers: ' + JSON.stringify(error)));
                    })
                    .catch(error => console.error("UPLOAD: getLayerByName ERROR: " + error));
            })
            .catch(error => this.refresh([]));
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

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        console.log('Upload File: REFRESH...');
        const name = this.props.worldName;
        this.props.updateWorld({ name, layers });
        this.setState({ hideSpinner: true } );
    };

    onError = (e: any) => {
        console.log("upload error: " + e.data);
    };

    render() {
        return (
            <div>
                <div className="content-section implementation">
                    <script src="vendors/exif-js/exif-js"/>
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

const mapStateToProps = (state: IState, { worldName, getAllLayersData }: any) => {
    return {
        getAllLayersData, worldName,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadFile);