"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("./feature");
const memory_1 = require("./memory");
class geoMap {
    constructor(pointStrips) {
        let time1 = performance.now();
        this.features = pointStrips.map(strip => new feature_1.feature(strip));
        this.lines = memory_1.GPUBufferSet.create([2 * 4, 3 * 4]);
        this.outlines = memory_1.GPUBufferSet.create([2 * 4, 2 * 4, 1 * 4]);
        this.polygons = memory_1.GPUBufferSet.create([2 * 4, 3 * 4]);
        let time2 = performance.now();
        let dlines = this.features.map(feature => feature.line);
        let doliens = this.features.map(feature => feature.outline);
        let dpoly = this.features.map(feature => feature.polygon);
        let time3 = performance.now();
        this.lines.addArray(dlines);
        this.outlines.addArray(doliens);
        this.polygons.addArray(dpoly);
        let time4 = performance.now();
        console.log(`create features: ${time2 - time1}`);
        console.log(`dense arrays: ${time3 - time2}`);
        console.log(`buffer writes: ${time4 - time3}`);
    }
    draw(viewMatrix) {
    }
}
exports.geoMap = geoMap;
