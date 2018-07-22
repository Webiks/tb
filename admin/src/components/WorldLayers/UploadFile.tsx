import * as React from 'react';

import config from "../../config/config";
import { connect } from "react-redux";
import { IState } from "../../store";
import { IWorld } from "../../interfaces/IWorld";
import { ITBAction } from '../../consts/action-types';
import { WorldsActions } from '../../actions/world.actions';
import { FileUpload } from 'primereact/components/fileupload/FileUpload';

/* Prime React components */
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    getAllLayersData: () => void,
    updateWorld: (worlds: IWorld) => ITBAction
}

class UploadFile extends React.Component {
    props: IPropsUploadFiles;
    url: string = `${config.baseUrl.path}/${config.baseUrl.api}/upload/${this.props.worldName}`;

    onUpload = (e: any) => {
        console.log("On Upload...");
        // get all the data of the new files
        this.props.getAllLayersData();
    };

    onError = (e: any) => {
        console.log("upload error: " + e.data);
    };

    render() {
        return (
            <div className="content-section implementation">
                <script src="vendors/exif-js/exif-js"/>
                <FileUpload mode="advanced" name="uploads" multiple={true} url={this.url}
                            accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg, .zip"
                            maxFileSize={config.maxFileSize} auto={false}
                            chooseLabel="Choose"
                            onUpload={this.onUpload}/>
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
    updateWorld: (payload: IWorld) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadFile);

// export interface IFileData {
//     size: number,
//     path: string,
//     name: string,
//     type: string,
//     mtime: Date
// }
// const reqFiles: IFileData[] = JSON.parse(e.xhr.response);