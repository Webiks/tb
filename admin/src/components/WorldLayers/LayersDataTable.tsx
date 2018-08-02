import * as React from 'react';
import { IWorld } from '../../interfaces/IWorld';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { IState } from '../../store';
import { WorldsActions } from '../../actions/world.actions';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { ILayer } from '../../interfaces/ILayer';
import { ITBAction } from '../../consts/action-types';
import { LayerService } from '../../services/LayerService';
import DataTableHeader from '../DataTable/DataTableHeader';
import UploadFile from './UploadFile';
import DisplayMap from '../DisplayMap/DisplayMap';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { DataTable } from 'primereact/components/datatable/DataTable';
import { Column } from 'primereact/components/column/Column';
import { Button } from 'primereact/components/button/Button';
import { Dialog } from 'primereact/components/dialog/Dialog';
import { WorldService } from '../../services/WorldService';

export interface IPropsLayers {
    worldName: string,
    layers: IWorldLayer[],
    world: IWorld,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction,
    navigateTo: (layerName: string) => void
}

export interface IStateTable {
    layers: IWorldLayer[],
    selectedLayer: any,
    displayMapWindow: boolean,
    displayAlert: boolean,
    globalFilter: any
}

class LayersDataTable extends React.Component {

    props: IPropsLayers;

    state: IStateTable = {
        layers: this.props.layers,
        selectedLayer: null,
        displayMapWindow: false,
        displayAlert: false,
        globalFilter: ''
    };

    // set state to initial state
    setInitialState = () =>
        this.setState({
            selectedLayer: null,
            displayMapWindow: false,
            displayAlert: false
        });

    setDisplayMap = (value) => this.setState({ displayMapWindow: value });

    editLayer = (layer: IWorldLayer) => {
        this.setState({
            selectedLayer: {...layer},
            displayMapWindow: false,
            displayAlert: false });
        this.props.navigateTo(`/world/${this.props.worldName}/layer/${layer.name}`);
    };

    deleteLayer = (rowData: ILayer) => {
        this.setState({
            selectedLayer: {...rowData},
            displayMapWindow: false,
            displayAlert: true });
        console.log("delete layer...");
    };

    delete = () => {
        console.log("selected layer: " + this.state.selectedLayer.name);
        console.log("LAYER DATA TABLE: delete layer...");
        // 1. delete the layer from GeoServer
        LayerService.deleteWorldLayer(this.props.worldName, this.state.selectedLayer._id)
            .then ( response => {
                // 2. update the layers' list to be without the deleted layer
                const layers =
                    this.props.world.layers.filter( worldLayer => worldLayer.name !== this.state.selectedLayer.name);

                // 3. update the world in the DataBase with the new list of layers
                WorldService.updateWorldField(this.props.world, 'layers', layers)
                    .then ( res => {
                        console.log(`Succeed to update ${this.props.worldName}'s layers`);
                        // 4. update the changes in the App Store and refresh the page
                        this.refresh(layers);
                    })
                    .catch(error => console.error('Failed to update the world layers: ' + error));
            })
            .catch(error => console.error('Failed to update the world layers: ' + error));
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        this.setState({ layers });
        console.log("Layer Data Table: updateLayers...");
        const name = this.props.worldName;
        this.props.updateWorld({ name, layers });
        this.setInitialState();
    };

    setGlobalFilter = (e: any) => this.setState({globalFilter: e.target.value});

    actionsButtons = (rowData: any, column: any) => {
        return (
            <div className="ui-button-icon ui-helper-clearfix">
                <Button type="button" icon="fa fa-search" className="ui-button-success" style={{margin: '3px 7px'}}
                        onClick={() => this.setState({selectedLayer: rowData, displayMapWindow: true})}/>
                <Button type="button" icon="fa fa-edit" className="ui-button-warning" style={{margin: '3px 7px'}}
                        onClick={() => this.editLayer(rowData)}/>
                <Button type="button" icon="fa fa-close" style={{margin: '3px 7px'}}
                        onClick={() => this.deleteLayer(rowData.layer)}/>
            </div>
        );
    };

    render(){

        const alertFooter = (
            <div>
                <Button label="Yes" icon="pi pi-check" onClick={() => this.delete()} />
                <Button label="No"  icon="pi pi-times" onClick={() => this.refresh(this.props.layers) } />
            </div>
        );

        return  (
            <div className="content-section implementation">
                {
                    this.props.layers &&
                    <div>
                        <DataTable  value={this.props.layers} paginator={true} rows={10} responsive={false}
                                    resizableColumns={true} autoLayout={true} style={{margin:'10px 20px'}}
                                    header={<DataTableHeader title={`${this.props.worldName} World's Files List`} setGlobalFilter={this.setGlobalFilter}/>}
                                    footer={<UploadFile worldName={this.props.worldName}/>}
                                    globalFilter={this.state.globalFilter}
                                    selectionMode="single" selection={this.state.selectedLayer}
                                    onSelectionChange={(e: any)=>{this.setState({selectedLayer: e.data});}}>
                            <Column field="layer.name" header="Name" sortable={true} style={{textAlign:'left', padding:'7px 20px'}}/>
                            <Column field="store.type" header="Type" sortable={true} style={{width: '10%'}} />
                            <Column field="store.format" header="Format" sortable={true} style={{width: '10%'}}/>
                            <Column field="layer.fileExtension" header="Extension" sortable={true} style={{width: '12%'}}/>
                            <Column field="''"  header="Date Created" sortable={true} style={{width: '12%'}}/>
                            <Column field="''" header="Last Modified" sortable={true} style={{width: '12%'}}/>
                            <Column field="inputData.affiliation" header="File Affiliation" sortable={true} style={{width: '10%'}}/>
                            <Column header="Actions" body={this.actionsButtons} style={{width: '12%'}}/>
                        </DataTable>
                    </div>
                }

                {
                    this.state.selectedLayer && this.state.displayMapWindow &&
                    <div>
                        <DisplayMap worldName={this.props.worldName}
                                    layer={this.state.selectedLayer}
                                    setDisplayMap={this.setDisplayMap}
                                    displayMapWindow={true}
                                    refresh={this.refresh}/>
                    </div>
                }

                {
                    this.state.selectedLayer && this.state.displayAlert &&
                    <div>
                        <Dialog visible={this.state.displayAlert}
                                width="350px" modal={true} footer={alertFooter} minY={70}
                                onHide={() => this.refresh(this.props.layers) }>
                            <b>DELETE</b> layer <b>{this.state.selectedLayer.layer.name}</b> ?
                        </Dialog>
                    </div>
                }

            </div>
        );
    }
}

const mapStateToProps = (state: IState, { worldName, ...props }: any) => {
    return {
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name),
        worldName, ...props
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload)),
    navigateTo: (location: string) => dispatch(push(location))
});

export default connect(mapStateToProps, mapDispatchToProps)(LayersDataTable);