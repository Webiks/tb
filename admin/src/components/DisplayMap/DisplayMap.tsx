import * as React from 'react';

import ol from 'openlayers';
import config from '../../config/config';
import { cloneDeep } from 'lodash';
import { WorldsActions } from '../../actions/world.actions';
import { connect } from 'react-redux';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { ITBAction } from '../../consts/action-types';
import { WorldService } from '../../services/WorldService';
import { LayerService } from '../../services/LayerService';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { Button } from 'primereact/components/button/Button';
import { InputText } from 'primereact/components/inputtext/InputText';
import { Dialog } from 'primereact/components/dialog/Dialog';

export interface IDisplayMapProps  {
    worldName: string,
    world: IWorld,
    layer: IWorldLayer,
    displayMapWindow: boolean,
    setDisplayMap: (value: boolean) => void,
    refresh: (layers: IWorldLayer[]) => void,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction,
}

export interface IMapState {
    selectedLayer: IWorldLayer,
    displayMapWindow: boolean
}

class DisplayMap extends React.Component {

    props: IDisplayMapProps ;
    state: IMapState ;

    layerIndex: number ;

    parser = new ol.format.WMTSCapabilities();
    projection: string = this.props.layer.data.latLonBoundingBox.crs;
    olProjection: string = 'EPSG:3857';
    map: any;
    json: any;
    olCenter: [number, number];
    frontLayer: any;

    componentWillMount() {
        this.setState({ selectedLayer: cloneDeep(this.props.layer),
                              displayMapWindow: true});
        this.layerIndex = this.props.world.layers.indexOf(this.props.layer);
        this.olCenter = ol.proj.transform(this.props.layer.data.center, this.projection, this.olProjection);
    }

    // get the Capabilities XML file in JSON format
    componentDidMount(){
        this.getJsonCapabilities()
            .then ( jsonFile => this.createMap(jsonFile))
            .catch( error => {
                console.error("DisplayMap ERROR: " + error);
                return error;
            });
    }

    // 1. get the Capabilities XML file
    getJsonCapabilities = () => {
        // return LayerService.getCapabilities(this.props.world.workspaceName, this.props.layer.name)
        return LayerService.getCapabilities(this.props.world.workspaceName, this.props.layer.name, config.isRemote)
            .then( xml => {
                console.log("1. get capabilities XML");
                // 2. convert the xml data to json
                this.json = this.parser.read(xml);
                // change the 'localhost' to the App domain (for the remote server)
                if (config.isRemote) {
                    const oldPath = /localhost/gi;
                    const jsonString = JSON.stringify(this.json).replace(oldPath, config.path);  // convert to JSON
                    this.json = JSON.parse(jsonString);                                          // convert to Object
                }
                return this.json;
            })
            .catch(error => { throw new Error(error) });
    };

    // 2. create the map
    createMap = (jsonFile : any) => {
        // 1. define the map options
        const options = ol.source.WMTS.optionsFromCapabilities(jsonFile,
            {
                projection: this.props.layer.data.srs,
                layer: this.props.layer.name,
                matrixSet: this.projection
            });
        console.log("3. finished to define the options");

        // 2. define the map's layers:
        // the world's map background layer
        const backLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            opacity: 0.8
        });
        // the image layer
        this.frontLayer = new ol.layer.Tile({
            opacity: this.state.selectedLayer.inputData.opacity,
            source: new ol.source.WMTS(options)
        });

        // 3. draw the map
        console.log("4. draw the OL Map...");
        this.map = new ol.Map({
            layers: [ backLayer, this.frontLayer ],
            target: 'map',
            view: new ol.View({
                projection: this.olProjection,
                center: this.olCenter,
                zoom: this.props.layer.inputData.zoom
            })
        });
        this.initListeners();
    };

    initListeners() {
        this.map.on('moveend', () => {
            const selectedLayer = { ...this.state.selectedLayer };
            this.updateProperty('zoom', this.map.getView().getZoom());
            // transform the center point from the ol projection to the file projection
            const center = ol.proj.transform(this.map.getView().getCenter(), this.olProjection , this.projection);
            this.updateProperty('center', center);
        });
    }

    onMapPropChanges(property, value) {
        // 1. update the App store
        this.updateProperty(property, value);
        // 2. update the map view
        this.frontLayer.setOpacity(this.state.selectedLayer.inputData.opacity);
        this.map.getView().setZoom(this.state.selectedLayer.inputData.zoom);
    }

    reset = () => {
        this.map.getView().setCenter(this.olCenter);
        this.map.getView().setZoom(this.props.layer.inputData.zoom);
    };

    // save the App state when the field's value is been changed (zoom or opacity) and refresh the map
    updateProperty(property, value) {
        const newLayer = { ...this.state.selectedLayer };
        switch (property){
            case ('center'):
                newLayer.data.center = value;
                break;
            case 'zoom':
            case 'opacity':
                newLayer.inputData[property] = value;
                break;
        }
        this.setState({ selectedLayer: { ...newLayer } });
    }

    // save the changes in the App store and the DataBase
    save = () => {
        const layers = [...this.props.world.layers];
        layers[this.layerIndex] = this.state.selectedLayer;
        // 1. update the changes in the database
        WorldService.updateWorldField(this.props.world, 'layers', layers)
            .then ( res =>  {
                console.warn(`Succeed to update ${this.props.worldName}'s layers`);
                // 2. update the changes in the App Store and refresh the page
                this.refresh(layers);
            })
            .catch( error => console.error('Failed to update the world: ' + error));
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        this.props.setDisplayMap(false);
        this.props.refresh(layers);
    };

    render() {

        const mapFooter = (
            <div className="ui-dialog-buttonpane ui-helper-clearfix">
                <Button label="Reset" icon="fa fa-undo" onClick={() => this.reset()} style={{ float: 'left', padding: '5px 10px', width: '30%'}}/>
                <Button label="Save" icon="fa fa-check" onClick={() => this.save()} style={{ padding: '5px 10px', width: '30%'}}/>
            </div>
        );

        return (
            <Dialog visible={this.props.displayMapWindow} modal={true}
                    header={`Layer '${this.props.layer.name}' map preview`}
                    footer={mapFooter}
                    responsive={true} style={{width:'35%'}}
                    onHide={() => this.refresh(this.props.world.layers)}>
                <div className="ui-grid ui-grid-responsive ui-fluid">
                    <div id="map" className="map" style={{ height: '400px', width: '100%' }}/>
                </div>
                {
                this.state.selectedLayer.inputData &&
                <div>
                    <div className="content-section implementation" style={{ textAlign: 'left', width: '70%', margin: '15px' }}>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ textAlign: 'left', padding: '5px' }}>
                                <label htmlFor="zoom">Zoom Level</label>
                            </div>
                            <div className="ui-grid-col-8" style={{ textAlign: 'left', padding: '5px' }}>
                                <InputText type="number" min="1" id="zoom"
                                           value={this.state.selectedLayer.inputData.zoom}
                                           onChange={(e: any) => { this.onMapPropChanges('zoom', e.target.value)}}/>
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ textAlign: 'left', padding: '5px' }}>
                                <label htmlFor="opacity">Opacity</label>
                            </div>
                            <div className="ui-grid-col-8" style={{ textAlign: 'left', padding: '5px' }}>
                                <InputText type="number" min="0" max="1" step="0.05" id="opacity"
                                           value={this.state.selectedLayer.inputData.opacity}
                                           onChange={(e: any) => { this.onMapPropChanges('opacity', e.target.value)}}/>
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ textAlign: 'left', padding: '5px' }}>
                                <label htmlFor="center">Center</label>
                            </div>
                            <div className="ui-grid-col-8" style={{ textAlign: 'left', padding: '5px' }}>
                                lon : { this.state.selectedLayer.data.center[0].toFixed(4) }
                            </div>
                            <div className="ui-grid-col-4" style={{ textAlign: 'left', padding: '5px' }}/>
                            <div className="ui-grid-col-8" style={{ textAlign: 'left', padding: '5px' }}>
                                lat : { this.state.selectedLayer.data.center[1].toFixed(4) }
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ textAlign: 'left', padding: '5px' }}>
                                Projection:
                            </div>
                            <div className="ui-grid-col-8" style={{ textAlign: 'left', padding: '5px' }}>
                                { this.projection }
                            </div>
                        </div>
                    </div>
                </div>
                }
            </Dialog>
        )
    }
}

const mapStateToProps = (state: IState, { worldName, ...props }: any) => {
    return {
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name),
        worldName, ...props
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(DisplayMap);
