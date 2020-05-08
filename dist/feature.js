"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kdTree_1 = require("./kdTree");
class Feature {
    constructor(strip, id, outline, polygon) {
        this.id = id;
        this.bBox = kdTree_1.boundingBox.fromStrip(strip);
        this.outline = outline;
        this.polygon = polygon;
        this.shape = strip;
    }
    static fromPointStrip(strip, id, constructor) {
        return new Feature(strip, id, constructor.featureOutlineBuffer(strip), constructor.featurePolygonBuffer(strip));
    }
}
exports.Feature = Feature;
