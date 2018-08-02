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
                        console.error("MongoCrud CREATE error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("added entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud ADD error: " + err);
                return reject(err);
            }
        });
    }

    get(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findOne(entityId, (err, entityReturn) => {
                    if (err) {
                        console.error("MongoCrud FIND-ONE error: " + err);
                        return reject(err);
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
                console.error("MongoCrud GET error: " + err);
                return reject(err);
            }
        });
    }

    getByQuery(query, selector) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findOne(query, selector, (err, entityReturn) => {
                    if (err) {
                        console.error("MongoCrud FIND-ONE error: " + err);
                        return reject(err);
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
                console.error("MongoCrud GET BY QUERY error: " + err);
                return reject(err);
            }
        });
    }

    getListByQuery (query, selector) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.find(query, selector).toArray((err, listReturn) => {
                    if (err) {
                        console.error("MongoCrud FIND(by query) error: " + err);
                        return reject(err);
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
                console.error("MongoCrud GET error: " + err);
                return reject(err);
            }
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.find({}, (err, entityReturn) => {
                    if (err) {
                        console.error("MongoCrud FIND error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("got all entities!");
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud GET-ALL error: " + err);
                return reject(err);
            }
        });
    }

    update(updatedEntity) {
        return new Promise((resolve, reject) => {
            try {
                console.log("MongoCrud UPDATE params: " + JSON.stringify(updatedEntity));
                this.mongoModel.findByIdAndUpdate({_id: updatedEntity._id}, updatedEntity, {new: true}, (err, entityReturn) => {
                    if (err) {
                        console.error("MongoCrud FIND-AND-UPDATE error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("update entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud UPDATE error: " + err);
                return reject(err);
            }
        });
    }

    updateField(entityId, updatedField, operation) {
        let updateOperation = {};
        // if (isArray) {
        //     updateOperation = {"$push" : updatedField};
        // } else {
        //     updateOperation = {"$set" : updatedField};
        // }
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
                        console.error("MongoCrud FIND-AND-UPDATE error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("update entity: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud UPDATE-FIELD error: " + err);
                return reject(err);
            }
        });
    }

    remove(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove(entityId, (err, entityReturn) => {
                    if (err) {
                        console.error("MongoCrud REMOVE error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("remove entity: " + entityReturn._id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud REMOVE error: " + err);
                return reject(err);
            }
        });
    }

    removeAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove({}, (err) => {
                    if (err) {
                        console.error("MongoCrud REMOVE-ALL error: " + err);
                        return reject(err);
                    }
                    else {
                        console.log("remove all!");
                        return reject(err);
                    }
                });
            }
            catch (err) {
                console.error("MongoCrud REMOVE-ALL error: " + err);
                return reject(err);
            }
        });
    }
}

module.exports = MongoCrud;
