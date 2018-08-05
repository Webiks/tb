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
    hideSpinner: boolean
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    state: IStateWorld = { hideSpinner: true };
    url: string = `${config.baseUrl.path}/${config.baseUrl.api}/upload/${this.props.world.workspaceName}`;

    onUpload = (e: any) => {
        console.log("On Upload...");
        this.getNewLayersData();
    };

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
                    .then(layers => {
                        console.log("getLayersDataByList getInputData...");
                        // set the final layers list and save it in the DataBase
                        const layersList = layers.map((layer: IWorldLayer) => {
                            // set the inputData to be EMPTY for the new layer
                            layer.inputData = this.setInitInputData(layer);
                            return layer;
                        });
                        // 3. update the Database (the layers field inside the world Model)
                        const newLayers = [...this.props.world.layers, ...layersList];
                        console.log("getLayersDataByList refreshing...");
                        return WorldService.updateWorldField(this.props.world, 'layers', newLayers)
                            .then ( world => {
                                // 4. update the App Store with the return world from the Database
                                console.log('Succeed to update the layers!');
                                return this.refresh(world.layers);
                            })
                            .catch( error => this.handleError('Failed to update the world layers: ' + error));
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

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        console.log('Upload File: REFRESH...');
        const name = this.props.worldName;
        this.props.updateWorld({ name, layers });
        this.setState({ hideSpinner: true } );
    };

    handleError = (message) => {
        console.error(message);
        return this.refresh(this.props.world.layers);
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