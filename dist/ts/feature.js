"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bufferConstructor_1 = require("./bufferConstructor");
class feature {
    constructor(outline) {
        this.line = new lineMemory(outline);
        this.outline = new outlineMemory(outline);
        this.polygon = new polygonMemory(outline);
    }
}
exports.feature = feature;
class polygonMemory {
    constructor(outline) {
        this.GPUOffset = -1;
        let GPUinfo = bufferConstructor_1.featureConstructor.polygonBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}
class lineMemory {
    constructor(outline) {
        this.GPUOffset = -1;
        let GPUinfo = bufferConstructor_1.featureConstructor.lineBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}
class outlineMemory {
    constructor(outline) {
        this.GPUOffset = -1;
        let GPUinfo = bufferConstructor_1.featureConstructor.outlineBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}
