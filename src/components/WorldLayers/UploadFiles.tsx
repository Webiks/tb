import * as React from 'react';

import config from '../../config/config';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { ITBAction } from '../../consts/action-types';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { IFileData } from '../../interfaces/IFileData';
import { IImageMetaData } from '../../interfaces/IImageMetaData';
import { IInputdata } from '../../interfaces/IInputData';
import { LayerService } from '../../services/LayerService';
import { WorldsActions } from '../../actions/world.actions';
import { AFFILIATION_TYPES } from '../../consts/layer-types';

/* Prime React components */
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { FileUpload } from 'primereact/components/fileupload/FileUpload';
import { ProgressSpinner } from 'primereact/components/progressspinner/ProgressSpinner';
import { Growl } from 'primereact/components/growl/Growl';

export interface IPropsUploadFiles {
    worldName: string,
    world: IWorld,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IReqFile {
    _id?: string,
    name: string;
    size: number;
    type: string;
    path: string;
    fileUploadDate: Date | string;
    fileType: string;
    filePath: string;
    encodeFileName: string;
    zipPath: string;
    tags?: IImageMetaData
}

export interface IStateWorld {
    hideSpinner: boolean;
    fileList: IFileData[];
}

class UploadFiles extends React.Component {
    props: IPropsUploadFiles;
    layersId: string[] = this.props.world.layersId ? this.props.world.layersId : [];
    state: IStateWorld = {
        hideSpinner: true,
        fileList: []
    };
    url: string = `${config.baseUrl}/v1/api/upload/${this.props.world._id}`;
    growl: any;
    uploadFiles: IFileData[];

    onSelect = (e: { originalEvent: Event, files: any }): void => {
        console.log('On Select...');
        let fileType: string;
        this.uploadFiles = [];
        // get a list of the e.files (change Files Object to an Array)
        const selectedFiles: IFileData[] = Array.from(e.files).map((file: File): IFileData => {
            // find the file Extension and Type
            const fileExtension = this.getExtension(file.name).toLowerCase();
            console.log(`fileExtension: ${fileExtension}`);
            if (fileExtension.includes('tif')) {
                fileType = 'raster';
            } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
                fileType = 'image';
            } else {
                fileType = 'vector';
            }
            return {
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                fileCreatedDate: new Date(file.lastModified).toISOString(),
                fileExtension,
                fileType,
                format: '',
            };
        });
        console.log(`selectedFiles Length: ${selectedFiles.length}`);
        // Check the Validation of the files
        // of MULTI-FILES
        if (selectedFiles.length > 1) {
            // 1. check that all the files are from the same type
            let rasterCounter: number = 0;
            let imageCounter: number = 0;
            let vectorCounter: number = 0;
            selectedFiles.forEach((file: IFileData) => {
                console.log('file type = ' + file.fileType);
                switch (file.fileType) {
                    case 'raster':
                        rasterCounter++;
                        break;
                    case 'image':
                        imageCounter++;
                        break;
                    case 'vector':
                        vectorCounter++;
                        break;
                }
            });

            if (rasterCounter !== 0 && rasterCounter === selectedFiles.length) {
                selectedFiles.map((raster: IFileData) => this.uploadFiles.push(raster));
            }
            else if (imageCounter !== 0 && imageCounter === selectedFiles.length) {
                selectedFiles.map((image: IFileData) => this.uploadFiles.push(image));
            }
            else if (vectorCounter !== 0 && vectorCounter === selectedFiles.length) {
                // 2. for VECTORS only
                // A. check that the mandatory .SHP file exist
                if (this.isShpFileExist(selectedFiles)) {
                    // B. check if all the Vector's files names are the same
                    const vectorName = this.getFileName(selectedFiles[0].name);
                    if (this.isNameDiffer(selectedFiles, vectorName)) {
                        this.showError('all the Vector\'s files must have the same name!');
                    } else {
                        // add the files to the Files List
                        selectedFiles.map((file: IFileData): any => this.uploadFiles.push(file));
                    }
                    console.log(`uploadFiles Length(vector validation): ${this.uploadFiles.length}`);
                }
            } else {
                this.showError('all the files must be from the same type!');
            }
        }
        // of a SINGLE file
        else {
            // if Vector - must have a .SHP file
            console.log('single file type = ' + selectedFiles[0].fileType);
            if (selectedFiles[0].fileType === 'vector') {
                // check that the mandatory file: .SHP exist
                if (this.isShpFileExist(selectedFiles)) {
                    // add the file to the Files List
                    this.uploadFiles.push(selectedFiles[0]);
                }
            } else {
                // add the file to the Files List
                this.uploadFiles.push(selectedFiles[0]);
            }
            console.log(`uploadFiles Length(single file validation): ${this.uploadFiles.length}`);
        }

        // 3. check the file name (of the valid files) to prevent duplicate names
        // check only if the file list is not empty
        if (this.uploadFiles.length > 0) {
            let selectedFileList: IFileData[];
            if (fileType === 'raster') {
                selectedFileList = this.uploadFiles;
            } else {
                // VECTORS - all the files are with the same name (check only the first file)
                selectedFileList = [this.uploadFiles[0]];
            }
            console.log(`selectedFileList Length(before check the name): ${selectedFileList.length}`);

            selectedFileList.map((file: IFileData) => {
                const name = this.getFileName(file.name);
                console.log('file name: ' + name);
                // 1. check if the name is already exist (only if there are layers in the world)
                if (this.props.world.layers.length > 0) {
                    if (this.isNameExist(name)) {
                        this.removeFileFromList(fileType, name);
                        this.showError(`the '${name}' file is already exist! please remove it or change its name!`);
                    }
                }
                // 2. check that there are no special characters in the name
                else if (this.checkForSpecialChar(name)) {
                    this.removeFileFromList(fileType, name);
                    this.showError(`one or more special characters was found! please, fix the file name!`);
                }
                else {
                    console.log('this file name is OK!');
                }
            });
            console.log(`uploadFiles Length(after check the name): ${this.uploadFiles.length}`);
            e.files = this.uploadFiles;
            this.setState({ fileList: this.uploadFiles });
        }
        // if the File List is empty - abort the upload operation
        if (this.uploadFiles.length === 0) {
            event.returnValue = false;
        }
    };

    onBeforeUpload = (e: { xhr: XMLHttpRequest, formData: any }): void => {
        console.log('On Before Upload...');
        e.formData = this.state.fileList;
        console.log(`onBeforeUpload formData: ${JSON.stringify(e.formData)}`);
        if (e.formData.length === 0) {
            this.showError(`the upload was canceled!`);
            e.xhr.abort();
        }
    };

    onProgress = (e: { originalEvent: ProgressEvent, progress: any }): void => {
        this.setState({ hideSpinner: false });
        const event = e.originalEvent;
        const percentComplete = Math.round(event.loaded * 100 / event.total);
        if (event.lengthComputable) {
            if (percentComplete === 0) {
                document.getElementById('progressNumber').innerHTML = 'getting File Data...';
            }
            else if (percentComplete < 100) {
                document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
            } else {
                document.getElementById('progressNumber').innerHTML = 'saving to DataBase...';
            }
        }
        else {
            document.getElementById('progressNumber').innerHTML = 'unable to compute';
        }
    };

    onUpload = (e: { xhr: XMLHttpRequest, files: any }): void => {
        console.log('On Upload...');
        // get the list of the upload files
        let parsingRes: any[] = JSON.parse(e.xhr.response);
        parsingRes = Array.isArray(parsingRes) ? parsingRes : [parsingRes];
        console.log('upload response: ', JSON.stringify(parsingRes));
        if (parsingRes.length === 0) {
            this.setState({ hideSpinner: true });
            this.showError('the upload was a failure!');
        } else {
            // update the layersId list
            parsingRes.map(layer => {
                this.layersId.push(layer._id);
            });
            // update the App Store with the new image
            const newLayers = [...this.props.world.layers, ...parsingRes];
            console.log('onUpload image refreshing...');
            this.refresh(this.layersId, newLayers);
        }
    };

    // get the name of the file (without the extension)
    getFileName = (name: string): string => name.split('.')[0];

    // get the extension of the file (include the point)
    getExtension = (name: string): any => name.substring(name.lastIndexOf('.'));

    // check if tne name contain special characters
    checkForSpecialChar = (name: string): boolean => {
        console.warn('checkForSpecialChar...');
        const specialChars = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;
        console.warn(`checkForSpecialChar result: ${specialChars.test(name)}`);
        return specialChars.test(name);
    };

    // check if the name exists in the layers list or in the DataBase (the store name)
    isNameExist = (name: string): any => this.props.world.layers.find(layer =>
        (this.getFileName(layer.fileData.name) === name || this.getFileName(layer.inputData.name) === name));

    // in VECTORS - check if there is a different name among all the Vector's files
    isNameDiffer = (fileList: IFileData[], name): any =>
        fileList.find((file: IFileData): any => this.getFileName(file.name) !== name);

    // in VECTORS - check if the .SHP file exist in the file list
    isShpFileExist = (fileList: IFileData[]): boolean => {
        if (this.isExtensionExist(fileList, '.shp')) {
            return true;
        } else {
            this.showError('can\'t upload Vector without a .SHP file!');
            return false;
        }
    };

    isExtensionExist = (fileList: IFileData[], ext: string): any =>
        fileList.find((file: IFileData): boolean => file.fileExtension.toLowerCase() === ext);

    findFileIndex = (name: string): number => {
        console.log('findFileIndex name: ', name);
        const file = this.uploadFiles.find((file: IFileData) => file.name === name);
        return this.uploadFiles.indexOf(file);
    };

    removeFileFromList = (fileType, name) => {
        // remove the file from the file list
        if (fileType === 'raster') {
            this.uploadFiles.splice(this.findFileIndex(name), 1);
        } else {
            this.uploadFiles = [];
        }
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
                                accept="image/tiff, .shp, .shx, .dbf, .prj, .qix, .fix, .xml, .sbn, .sbx, .cpg, .jpeg, .jpg"
                                maxFileSize={config.maxFileSize} auto={false}
                                chooseLabel="Choose Files (no zip)"
                                onSelect={this.onSelect}
                                onBeforeUpload={this.onBeforeUpload}
                                onProgress={this.onProgress}
                                onUpload={this.onUpload}/>
                </div>
                <div hidden={this.state.hideSpinner}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="#EEEEEE"
                                     animationDuration=".5s"/>
                    <div id="progressNumber"/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: IState, { worldName }: any) => {
    return {
        worldName,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
    };
};

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadFiles);