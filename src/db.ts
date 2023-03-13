import fs from "node:fs";
import path from "node:path";

class JsonDB {
    path
    isFormatted
    delimiter
    constructor(path: string, isFormatted: boolean, delimiter: string) {
        this.path = path
        this.isFormatted = isFormatted
        this.delimiter = delimiter
    }

    getData(str: string) {
        try {
            const path_list = str.split(this.delimiter);
            const data = JSON.parse(fs.readFileSync(this.path).toString());
            let res = data
            path_list.filter(path => path).forEach(p => {
                res = (res || data)[p]
            });
            return res
        } catch (error) {
            console.log(error);
        }
    }

    push(str: string, val: any) {
        try {
            const path_list = str.split(this.delimiter);
            const _data = fs.readFileSync(this.path);
            const data = JSON.parse(_data.toString());
            let res = data
            const new_path_list = path_list.filter(path => path)
            new_path_list.forEach((p, index) => {
                if (index === new_path_list.length - 1) {
                    (res || data)[p] = val
                } else {
                    res = (res || data)[p];
                }
            });
            fs.writeFileSync(this.path, this.isFormatted ? JSON.stringify(data, null, 4) : JSON.stringify(data));
        } catch (error) {
            console.log(error);
        }
    }

    exists(str: string) {
        try {
            const path_list = str.split(this.delimiter);
            const _data = fs.readFileSync(this.path);
            const data = JSON.parse(_data.toString());
            let res = data
            path_list.filter(path => path).forEach(p => {
                res = (res || data)[p]
            });
            return !!res
        } catch (error) {
            console.error(error);
            return false
        }
    }
}

try {
    Deno.statSync("db");
} catch (error) {
    Deno.mkdirSync("db");
}

const configDBFile = path.resolve("db", "config.json");
const runtimeDBFile = path.resolve("db", "runtime.json");
const snapshotDBFile = path.resolve("db", "snapshot.json");
const systemDBFile = path.resolve("db", "system.json");

[configDBFile, runtimeDBFile, snapshotDBFile, systemDBFile].forEach(file => {
    try {
        Deno.statSync(file);
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            Deno.writeTextFileSync(file, "{}")
        }
    }
})

const isFormatted = true;
export const configDB = new JsonDB(configDBFile, isFormatted, "/");
export const runtimeDB = new JsonDB(runtimeDBFile, isFormatted, "/");
export const snapshotDB = new JsonDB(snapshotDBFile, isFormatted, "/");
export const systemDB = new JsonDB(systemDBFile, isFormatted, "/");
