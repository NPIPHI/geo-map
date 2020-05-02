"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = require("./map");
const main_1 = require("./main");
const bbox = { minx: 6429499.583465844, miny: 1797629.5004901737, maxx: 6446651.559660509, maxy: 1805369.9351405054 };
async function loadMapBinary() {
    let file = await fetch("../mapData/output.buf");
    let buffer = await file.arrayBuffer();
    let mapData = await (await fetch("../mapData/output.json")).json();
    let pointArray = new Float32Array(buffer);
    let pointPaths = [];
    let idList = [];
    mapData.shapes.forEach((shape) => {
        pointPaths.push(pointArray.slice(shape[1], shape[1] + shape[2] * 2 - 2));
        idList.push(shape[0]);
    });
    return { points: pointPaths, ids: idList };
}
exports.loadMapBinary = loadMapBinary;
function loadMapChuncksBinary(dir) {
    let geoMap = new map_1.mapLayer([], []);
    fetch(dir + "/meta.json").then(file => file.json().then(meta => {
        for (let i = 6; i < meta.count; i++) {
            addMapBinary(dir + "/" + i, geoMap);
        }
    }));
    return geoMap;
}
exports.loadMapChuncksBinary = loadMapChuncksBinary;
function addMapBinary(path, target) {
    return new Promise(resolve => {
        parseMapBinary(path).then(mapData => {
            let time1 = performance.now();
            target.addFeatures(mapData, []);
            main_1.invalidate();
            console.log(`Adding ${mapData.length} features took ${performance.now() - time1} ms`);
            console.log(performance.now());
            resolve();
        });
    });
}
async function parseMapBinary(path) {
    return new Promise(resolve => {
        new binaryLoader(path, (points, indices) => {
            let pointPaths = [];
            for (let i = 0; i < indices.length; i += 2) {
                let path = new Float32Array(indices[i + 1] * 2);
                for (let j = 0; j < indices[i + 1]; j++) {
                    path[j * 2] = points[i * 2 + j * 2];
                    path[j * 2 + 1] = points[i * 2 + j * 2 + 1];
                }
                pointPaths.push(path);
            }
            resolve(pointPaths);
        });
    });
}
class binaryLoader {
    constructor(path, resolve) {
        fetch(path + "points.bin").then(points => {
            points.arrayBuffer().then(buffer => {
                this.points = new Float32Array(new Int8Array(buffer).buffer);
                if (this.indices) {
                    this.resolve(this.points, this.indices);
                }
            });
        });
        fetch(path + "indices.bin").then(indices => {
            indices.arrayBuffer().then(buffer => {
                this.indices = new Int32Array(new Int8Array(buffer).buffer);
                if (this.points) {
                    this.resolve(this.points, this.indices);
                }
            });
        });
        this.resolve = resolve;
    }
}
async function parseMapJson(path = "../mapData/slabs.json") {
    let rawData = await fetch(path);
    let jsonData = await rawData.json();
    let pointPaths = [];
    let idList = [];
    let xRescale = 1 / (bbox.maxx - bbox.minx);
    let yRescale = 1 / (bbox.maxx - bbox.minx);
    let xOffset = bbox.minx;
    let yOffset = bbox.miny;
    jsonData.forEach((slab) => {
        let points = slab.geometry.coordinates[0][0];
        let strip = new Float32Array(points.length * 2 - 2);
        for (let i = 0; i < points.length - 1; i++) {
            strip[i * 2] = (points[i][0] - xOffset) * xRescale;
            strip[i * 2 + 1] = (points[i][1] - yOffset) * yRescale;
        }
        idList.push(slab.properties.BRANCH_ID + "-" + slab.properties.SECTION_ID + "-" + slab.properties.postgis_id);
        pointPaths.push(strip);
    });
    return { points: pointPaths, ids: idList };
}
function loadMapChuncks(dir) {
    let geoMap = new map_1.mapLayer([], []);
    fetch(dir + "/meta.json").then(file => file.json().then(meta => {
        for (let i = 0; i < meta.count; i++) {
            addMapJson(dir + "/" + i + ".json", geoMap);
        }
    }));
    return geoMap;
}
exports.loadMapChuncks = loadMapChuncks;
async function addMapJson(path, target) {
    return new Promise(resolve => {
        parseMapJson(path).then(mapData => {
            let time1 = performance.now();
            target.addFeatures(mapData.points, mapData.ids);
            main_1.invalidate();
            console.log(`Adding ${mapData.ids.length} features took ${performance.now() - time1} ms`);
            console.log(performance.now());
            resolve();
        });
    });
}
