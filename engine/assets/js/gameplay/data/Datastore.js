import Observable from "../../networking/Observable.js";
export default class Datastore {
    constructor(data) {
        if (!data) {
            data = {}
        }
        this.data = data;
    }

    setData(data) {
        this.data = data;
    }

    get(key) {
        return this.data[key];
    }
}