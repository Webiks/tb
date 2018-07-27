// export class MongoCrud {
class MongoCrud {

    constructor(mongoModel) {
        this.mongoModel = mongoModel;
    }

    add(entityToAdd){
        return new Promise((resolve, reject) => {
            this.mongoModel.collection.dropIndexes();
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

    updateField(entityId, updatedField) {
        return new Promise((resolve, reject) => {
            try {
                console.log("MongoCrud UPDATE-FIELD params: " + entityId + ', ' + JSON.stringify(updatedField));
                this.mongoModel.findByIdAndUpdate({_id: entityId}, {"$set" : updatedField}, {new: true}, (err, entityReturn) => {
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
                this.mongoModel.remove({_id : entityId}, (err, entityReturn) => {
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
                        return resolve();
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
