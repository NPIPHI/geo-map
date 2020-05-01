"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = require("./map");
const main_1 = require("./main");
const bbox = { minx: 6429499.583465844, miny: 1797629.5004901737, maxx: 6446651.559660509, maxy: 1805369.9351405054 };
async function loadMap() {
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
exports.loadMap = loadMap;
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
        idList.push(slab.properties.BRANCH_ID + "-" + slab.properties.SECTION_ID + "-" + slab.properties.SAMPLE_ID);
        pointPaths.push(strip);
    });
    return { points: pointPaths, ids: idList };
}
exports.parseMapJson = parseMapJson;
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
        });
    });
}
