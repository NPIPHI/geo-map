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
        this.invalidated = false;
        this.bBox = region;
        this.canvas = canvas;
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
        this.inputHandler = new inputHandler_1.inputHandler(canvas, this.camera, this.invalidate.bind(this));
        this.loop();
    }
    loop() {
        this.inputHandler.pollEvents();
        if (this.invalidated) {
            this.render();
            this.invalidated = false;
        }
        requestAnimationFrame(this.loop.bind(this));
    }
    invalidate() {
        this.invalidated = true;
    }
    render() {
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
        let view = this.camera.view;
        this.renderer.clear();
        this.layers.forEach(layer => {
            this.renderer.renderMap(layer, view, true, true);
        });
    }
    createLayer(name, zIndex = 0) {
        return new map_1.mapLayer(name, this.bBox, this.bufferConstructor, this.invalidate.bind(this), zIndex);
    }
    addLayer(layer) {
        this.layers.push(layer);
        this.inputHandler.targets.push(layer);
    }
    async addData(layer, geometry, ids) {
        return new Promise(resolve => {
            layer.addFeatures(geometry, ids);
            this.invalidate();
            resolve();
        });
    }
    async loadData(layer, path, encoding) {
        let invalidate = this.invalidate.bind(this);
        if (encoding === "binary") {
            return new Promise(resolve => {
                mapLoad_1.addMapBinary(path, layer).then(() => { invalidate(); resolve(); });
            });
        }
        if (encoding === "json") {
            return new Promise(resolve => {
                mapLoad_1.addMapJson(path, layer).then(() => { invalidate(); resolve(); });
            });
        }
    }
    async loadDataChuncks(layer, dir, encoding) {
        let invalidate = this.invalidate.bind(this);
        if (encoding === "binary") {
            return mapLoad_1.loadMapChuncksBinary(dir, layer, invalidate);
        }
        if (encoding === "json") {
            return mapLoad_1.loadMapChuncksJSON(dir, layer, invalidate);
        }
    }
}
exports.GeoMap = GeoMap;
