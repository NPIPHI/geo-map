"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("./feature");
const memory_1 = require("./memory");
const bufferConstructor_1 = require("./bufferConstructor");
class geoMap {
    constructor(pointStrips) {
        let time1 = performance.now();
        let outlineData = bufferConstructor_1.bufferConstructor.outlineBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        let time2 = performance.now();
        let polygonData = bufferConstructor_1.bufferConstructor.polygonBuffer(pointStrips);
        this.polygons = polygonData.buffer;
        let time3 = performance.now();
        console.log(time2 - time1);
        console.log(time3 - time2);
        this.features = [];
        for (let i = 0; i < pointStrips.length; i++) {
            this.features.push(new feature_1.feature(new memory_1.GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]), new memory_1.GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
    }
    draw(viewMatrix) {
    }
}
exports.geoMap = geoMap;
