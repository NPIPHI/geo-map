"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bufferConstructor_1 = require("./bufferConstructor");
class feature {
    constructor(outline, polygon) {
        this.outline = outline;
        this.polygon = polygon;
    }
    fromPointStrip(strip) {
        this.outline = bufferConstructor_1.featureConstructor.outlineBuffer(strip);
        this.polygon = bufferConstructor_1.featureConstructor.polygonBuffer(strip);
    }
}
exports.feature = feature;
