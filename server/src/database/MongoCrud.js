// export class MongoCrud {
class MongoCrud {

    constructor(mongoModel) {
        this.mongoModel = mongoModel;
    }

    add(entityToAdd){
        return new Promise((resolve, reject) => {
            if (this.mongoModel.collection){
                this.mongoModel.collection.dropIndexes();
            }
            console.log("mongoModel ADD: " + this.mongoModel);
            try {
                this.mongoModel.create(entityToAdd, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `CREATE error: ${err}`);
                    }
                    else {
                        console.log("added entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `ADD error: ${err}`);
            }
        });
    }

    get(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findOne(entityId, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `FIND(by ID) error: ${err}`);
                    }
                    else {
                        if (entityReturn) {
                            console.log("got entity: " + entityReturn.id);
                        }
                        else {
                            console.error("entity id:" + entityId + "doesn't exist");
                            entityReturn = {};
                        }
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `GET(by ID) error: ${err}`);
            }
        });
    }

    getByQuery(query, selector) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findOne(query, selector, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `FIND-ONE(by query) error: ${err}`);
                    }
                    else {
                        if (entityReturn) {
                            console.log("got entity: " + entityReturn.id);
                            console.log("entityReturn: " + JSON.stringify(entityReturn));
                        }
                        else {
                            console.error("can't find this entity!");
                            entityReturn = {};
                        }
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `GET-ONE(by query) error: ${err}`);
            }
        });
    }

    getListByQuery (query, selector) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.find(query, selector).toArray((err, listReturn) => {
                    if (err) {
                        this.handleError(reject, err, `FIND-LIST(by query) error: ${err}`);
                    }
                    else {
                        if (listReturn) {
                            console.log("got list of entities: " + listReturn);
                        }
                        else {
                            console.error("find no match to the query!");
                            listReturn = [];
                        }
                        return resolve(listReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `GET-LIST(by query) error: ${err}`);
            }
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.find({}, (err, entitiesReturn) => {
                    if (err) {
                        this.handleError(reject, err, `GET-ALL error: ${err}`);
                    }
                    else {
                        console.log("got all entities!");
                        return resolve(entitiesReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `GET-ALL error: ${err}`);
            }
        });
    }

    update(updatedEntity) {
        return new Promise((resolve, reject) => {
            try {
                console.log("MongoCrud UPDATE params: " + JSON.stringify(updatedEntity));
                this.mongoModel.findByIdAndUpdate({_id: updatedEntity._id}, updatedEntity, {new: true}, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `FIND-AND-UPDATE error: ${err}`);
                    }
                    else {
                        console.log("update entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `UPDATE error: ${err}`);
            }
        });
    }

    updateField(entityId, updatedField, operation) {
        let updateOperation = {};
        switch (operation){
            case ('update'):
                updateOperation = {"$set" : updatedField};
                break;
            case ('updateArray'):
                updateOperation = {"$push" : updatedField};
                break;
            case ('removeFromArray'):
                updateOperation = {"$pull" : updatedField};
                break;
            default:
                console.error("updateField Error: operation parameter is wrong!");
        }

        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findByIdAndUpdate(entityId, updateOperation, {new: true}, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `FIND-AND-UPDATE-FIELD error: ${err}`);
                    }
                    else {
                        console.log("update entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `UPDATE-FIELD error: ${err}`);
            }
        });
    }

    remove(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove(entityId, (err, entityReturn) => {
                    if (err) {
                        this.handleError(reject, err, `REMOVE error: ${err}`);
                    }
                    else {
                        console.log("remove entity: " + entityReturn._id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                this.handleError(reject, err, `REMOVE error: ${err}`);
            }
        });
    }

    removeAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove({}, (err) => {
                    if (err) {
                        this.handleError(reject, err, `REMOVE-ALL error: ${err}`);
                    }
                    else {
                        console.log("remove all!");
                        return resolve();
                    }
                });
            }
            catch(err) {
                this.handleError(reject, err, `REMOVE-ALL error: ${err}`);
            }
        });
    }

    handleError(reject, err, message){
        console.error('MongoCrud: ' + message);
        return reject(err);
    };
}

module.exports = MongoCrud;
