import * as React from 'react';

import config from "../../config/config";
import { connect } from "react-redux";
import { IState } from "../../store";
import { IWorld } from "../../interfaces/IWorld";
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { ITBAction } from '../../consts/action-types';
import { WorldsActions } from '../../actions/world.actions';
import { LayerService } from '../../services/LayerService';

/* Prime React components */
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { FileUpload } from 'primereact/components/fileupload/FileUpload';

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    updateWorld: (worlds: IWorld) => ITBAction,
    getAllLayersData: () => void
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    url: string = `${config.baseUrlApi}/upload/${this.props.worldName}`;

    componentDidMount() {
        this.url = `${config.baseUrlApi}/upload/${this.props.worldName}`;
        console.warn("upload file url: " + this.url);
    };

    // get all the world's layer again after adding the new layer
    onUpload = (e: any) => {
        console.log("On Upload...");
        // update the layers' list
        // this.props.getAllLayersData();
    };

    updateLayers = (layers: IWorldLayer[]) => {
        console.log("upload: updateLayers...");
        const name = this.props.worldName;
        this.props.updateWorld({ name, layers });
    };

    onError = (e: any) => {
        console.log("error: " + e.data);
    };

    render() {
        return (
            <div className="content-section implementation">
                <FileUpload mode="advanced" name="uploads" multiple={true} url={this.url}
                            accept="image/tiff, .shp,.shx, .dbf,.prj, .qix, .xml, .sbn, .sbx, .zip"
                            maxFileSize={config.maxFileSize} auto={false}
                            chooseLabel="add"
                            onSelect={(e:any) => console.warn("select file")}
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