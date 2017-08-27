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
        return Datastore.get(this.data, key);
    }

    set(key, value) {
        return Datastore.set(this.data, key, value);
    }
}

Datastore.get = (data, key) => {
    const parts = key.split(".");
    for (const p in parts) {
        if (data == null) {
            return;
        }
        const part = parts[p];
        data = data[part];
    }
    return data;
}

Datastore.set = (data, key, value) => {
    const parts = key.split(".");
    for (let p = 0; p < parts.length - 1; p++) {
        const part = parts[p];
        if (data[part] == null) {
            data[part] = {}
        }
        data = data[part];
    }
    data[parts[parts.length - 1]] = value;
}