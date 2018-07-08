import * as React from 'react';
import { IWorld } from '../../interfaces/IWorld';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { IState } from '../../store';
import { WorldsActions } from '../../actions/world.actions';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { ITBAction } from '../../consts/action-types';
import { LayerService } from '../../services/LayerService';
import { ILayer } from '../../interfaces/ILayer';
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

export interface IPropsLayers {
    worldName: string,
    layers: IWorldLayer[],
    world: IWorld,
    getAllLayersData: () => void,
    updateWorld: (worlds: IWorld) => ITBAction,
    navigateTo: (layerName: string) => void
}

export interface IStateTable {
    layers: IWorldLayer[],
    selectedLayer: any,
    displayDialog: boolean,
    globalFilter: any
}

class LayersDataTable extends React.Component {

    props: IPropsLayers;

    state: IStateTable = {
        layers: this.props.layers,
        selectedLayer: null,
        displayDialog: false,
        globalFilter: ''
    };

    // set state to initial state
    setInitialState = () =>
        this.setState({
            selectedLayer: null,
            displayDialog: false
    });

    editLayer = (layer: IWorldLayer) => {
        this.props.navigateTo(`/world/${this.props.worldName}/layer/${layer.layer.name}`);
    };

    deleteLayer = (layer: ILayer) => {
        const confirmation = confirm(`Are sure you want to DELETE ${layer.name}?`);
        if (confirmation){
            LayerService.deleteLayerById(this.props.worldName, layer)
                .then(response => {
                    console.log("LAYER DATA TABLE: delete layer...");
                    // update the layers' list
                    const layers = this.props.world.layers.filter( worldLayer => worldLayer.layer.name !== layer.name);
                    this.refresh(layers);
                })
                .catch(error => this.refresh([]));
        }
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        this.setState({ layers });
        console.log("Layer Data Table: updateLayers...");
        const name = this.props.worldName;
        this.props.updateWorld({ name, layers });
        // this.props.setStateWorld();
        this.setInitialState();
    };

    setGlobalFilter = (e: any) => this.setState({globalFilter: e.target.value});

    actionsButtons = (rowData: any, column: any) => {
        return (
            <div className="ui-button-icon ui-helper-clearfix">
                <Button type="button" icon="fa fa-search" className="ui-button-success" style={{margin: '3px 7px'}}
                        onClick={() => this.setState({selectedLayer: rowData, displayDialog: true})}/>
                <Button type="button" icon="fa fa-edit" className="ui-button-warning" style={{margin: '3px 7px'}}
                        onClick={() => {
                            this.setState({selectedLayer: rowData, displayDialog: false});
                            this.editLayer(rowData)
                        }}/>
                <Button type="button" icon="fa fa-close" style={{margin: '3px 7px'}}
                        onClick={() => {
                            this.setState({selectedLayer: rowData, displayDialog: false});
                            this.deleteLayer(rowData.layer)
                        }}/>
            </div>
        );
    };

    render(){
        return  (
            <div className="content-section implementation">
                {
                    this.props.layers && <div>
                        <DataTable  value={this.props.layers} paginator={true} rows={10} responsive={false}
                                    resizableColumns={true} autoLayout={true} style={{margin:'10px 20px'}}
                                    header={<DataTableHeader title={`${this.props.worldName} World's Files List`} setGlobalFilter={this.setGlobalFilter}/>}
                                    footer={<UploadFile worldName={this.props.worldName} getAllLayersData={this.props.getAllLayersData}/>}
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
                    this.state.selectedLayer && <div>
                        <Dialog visible={this.state.displayDialog} modal={true}
                                header={`Layer '${this.state.selectedLayer.layer.name}' map preview`}
                                onHide={() => this.refresh(this.props.world.layers)}>
                            <DisplayMap worldName={this.props.worldName} layer={this.state.selectedLayer}/>
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
    updateWorld: (payload: IWorld) => dispatch(WorldsActions.updateWorldAction(payload)),
    navigateTo: (location: string) => dispatch(push(location))
});

export default connect(mapStateToProps, mapDispatchToProps)(LayersDataTable);
