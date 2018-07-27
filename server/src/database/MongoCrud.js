// export class MongoCrud {
class MongoCrud {

    constructor(mongoModel) {
        this.mongoModel = mongoModel;
    }

    add(entityToAdd){
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.create(entityToAdd, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("added mission: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }

    get(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findOne(entityId, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        if (entityReturn) {
                            this.logService.log("got mission: " + entityReturn.id);
                        }
                        else {
                            this.logService.error("mission id:" + entityId + "doesn't exist");
                            entityReturn = {};
                        }
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e) ;
                return reject(e);
            }
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.find({}, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("got all missions");
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }

    update(updatedEntity) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findByIdAndUpdate({_id: updatedEntity._id}, updatedEntity, {new: true}, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("update mission: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }

    updateField(entityId, updatedField) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.findByIdAndUpdate({_id: entityId}, {"$set" : updatedField}, {new: true}, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("update mission: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }

    remove(entityId) {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove({_id : entityId}, (err, entityReturn) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("remove mission: " + entityReturn.id);
                        return resolve(entityReturn);
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }

    removeAll() {
        return new Promise((resolve, reject) => {
            try {
                this.mongoModel.remove({}, (err) => {
                    if (err) {
                        this.logService.error(err);
                        return reject(err);
                    }
                    else {
                        this.logService.log("remove all: ");
                        return resolve();
                    }
                });
            }
            catch (e) {
                this.logService.error(e);
                return reject(e);
            }
        });
    }
}

module.exports = MongoCrud;