"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const bbox = { x1: 6429499, y1: 1797629, x2: 6446651, y2: 1805369 };
const squareBbox = { x1: 6429499, y1: 1792923, x2: 6446651, y2: 1810075 };
function init() {
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    let map = new index_1.GeoMap(canvas, bbox);
    let tileMap = map.createLayer("tile");
    let featureMap = map.createLayer("feature");
    map.addLayer(tileMap);
    map.addLayer(featureMap);
    map.loadDataChuncks(tileMap, "./binaryChuncks", "binary");
    tileMap.setStyleTableFromArray("polygon", [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.8, 0.8, 0.8, 1, 0.9, 0.9, 0.9, 1], [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.5, 0.5, 1]);
    tileMap.setStyleTableFromArray("outline", [0, 0, 0.6, 2, 0, 1, 0, 3, 0, 0, 1, 8, 0, 0, 0.6, 2, 0, 0, 0.6, 2], [0.4, 0.2, 0.0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    featureMap.setStyleTableFromArray("polygon", [1, 0.5, 0.5, 1, 0, 0, 1, 1], [1, 0.5, 0.5, 0, 1, 1, 1, 0]);
    featureMap.setStyleTableFromArray("outline", [1, 0, 0, 4, 0, 1, 0, 4], [1, 0, 0, 0, 1, 1, 1, 0]);
}
init();
