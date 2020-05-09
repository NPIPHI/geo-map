"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = require("./map");
const renderer_1 = require("./renderer");
const mapLoad_1 = require("./mapLoad");
const bufferConstructor_1 = require("./bufferConstructor");
const camera_1 = require("./camera");
const inputHandler_1 = require("./inputHandler");
class GeoMap {
    constructor(canvas, region) {
        this.layers = [];
        this.bBox = region;
        if (this.bBox.x2 - this.bBox.x1 > this.bBox.y2 - this.bBox.y1) {
            let yCenter = (this.bBox.y1 + this.bBox.y2) / 2;
            let yOffset = (this.bBox.x2 - this.bBox.x1) / 2;
            this.squareRegion = { x1: this.bBox.x1, y1: yCenter - yOffset, x2: this.bBox.x2, y2: yCenter + yOffset };
        }
        else {
            let xCenter = (this.bBox.x1 + this.bBox.x2) / 2;
            let xOffset = (this.bBox.y2 - this.bBox.y1) / 2;
            this.squareRegion = { y1: this.bBox.y1, x1: xCenter - xOffset, y2: this.bBox.y2, x2: xCenter + xOffset };
        }
        this.gl = canvas.getContext("webgl2");
        exports.gl = this.gl;
        this.renderer = new renderer_1.mapRenderer(this.gl);
        this.camera = new camera_1.camera(this.squareRegion);
        this.camera.setAespectRatio(canvas.width, canvas.height);
        this.bufferConstructor = new bufferConstructor_1.bufferConstructor(this.squareRegion);
        this.inputHandler = new inputHandler_1.inputHandler(canvas, this.camera, () => this.render);
    }
    render() {
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
        let view = this.camera.view;
        this.layers.forEach(layer => {
            this.renderer.renderMap(layer, view, true, true);
        });
    }
    createLayer(name, zIndex = 0) {
        return new map_1.mapLayer(name, this.bBox, this.bufferConstructor, zIndex);
    }
    addLayer(layer) {
        this.layers.push(layer);
        this.inputHandler.targets.push(layer);
    }
    async addData(layer, geometry, ids) {
        return new Promise(resolve => {
            layer.addFeatures(geometry, ids);
            resolve();
        });
    }
    async loadData(layer, path, encoding) {
        if (encoding === "binary") {
            return mapLoad_1.addMapBinary(path, layer);
        }
        if (encoding === "json") {
            return mapLoad_1.addMapJson(path, layer);
        }
    }
    async loadDataChuncks(layer, dir, encoding) {
        if (encoding === "binary") {
            return mapLoad_1.loadMapChuncksBinary(dir, layer);
        }
        if (encoding === "json") {
            return mapLoad_1.loadMapChuncksBinary(dir, layer);
        }
    }
}
exports.GeoMap = GeoMap;
