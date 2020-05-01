"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bufferConstructor_1 = require("./bufferConstructor");
const kdTree_1 = require("./kdTree");
class Feature {
    constructor(strip, id, outline, polygon) {
        this.id = id;
        this.bBox = kdTree_1.boundingBox.fromStrip(strip);
        this.outline = outline;
        this.polygon = polygon;
        this.shape = strip;
    }
    static fromPointStrip(strip, id) {
        return new Feature(strip, id, bufferConstructor_1.featureConstructor.outlineBuffer(strip), bufferConstructor_1.featureConstructor.polygonBuffer(strip));
    }
}
exports.Feature = Feature;
