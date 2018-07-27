import * as React from 'react';

import config from "../../config/config";
import { connect } from "react-redux";
import { IState } from "../../store";
import { IWorld } from "../../interfaces/IWorld";
import { ITBAction } from '../../consts/action-types';
import { WorldsActions } from '../../actions/world.actions';


/* Prime React components */
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { FileUpload } from 'primereact/components/fileupload/FileUpload';
import WorldLayers from './WorldLayers';
import { push } from 'react-router-redux';
import { LayerService } from '../../services/LayerService';
import { IWorldLayer } from '../../interfaces/IWorldLayer';

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    updateWorld:  (worlds: Partial<IWorld>) => ITBAction,
    getAllLayersData: () => void
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    url: string = `${config.baseUrl.path}/${config.baseUrl.api}/upload/${this.props.worldName}`;

    // get all the world's layer again after adding the new layer
    onUpload = (e: any) => {
        console.log("On Upload..." + JSON.stringify(e));
        this.props.getAllLayersData();
        // // 1. get the new layers list
        // LayerService.getWorldLayers(this.props.worldName)
        //     .then(layersList => {
        //         // 2. find the new layer by comparing the layers list with the App store list
        //         const newLayer = layersList.filter( layer => {
        //             // for (const layerProp of this.props.world.layers) {
        //             //     console.log("layer..." + layer.name);
        //             //     console.log("layerProp..." + layerProp.name);
        //             //     return layer.name !== layerProp.layer.name;
        //             // }
        //             this.props.world.layers.forEach ( layerProp =>
        //                  layer.name !== layerProp.layer.name );
        //             });
        //             console.log("filter new layer..." + newLayer.name);
        //             // return newLayer;
        //         // 3. getting the data of the new layer
        //         LayerService.getLayerByName(this.props.worldName, newLayer)
        //             .then(layer => {
        //                 const layers = [...this.props.world.layers, layer];
        //                 this.refresh(layers);
        //                 console.log("end get layer by name..." + layers);
        //             })
        //             .catch(error => console.error("upload error: " + error));
        //         });
    };

    onError = (e: any) => {
        console.log("upload error: " + e.data);
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        console.log('upload: REFRESH...');
        const name = this.props.world.name;
        this.props.updateWorld({ name, layers });
    };

    render() {
        return (
            <div className="content-section implementation">
                <FileUpload mode="advanced" name="uploads" multiple={true} url={this.url}
                            accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg, .zip"
                            maxFileSize={config.maxFileSize} auto={false}
                            chooseLabel="add"
                            onUpload={this.onUpload}/>
            </div>
        )
    }
}

const mapStateToProps = (state: IState, { worldName, getAllLayersData }: any) => {
    return {
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name),
        worldName, getAllLayersData
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: IWorld) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadFile);