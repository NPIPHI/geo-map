"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("./feature");
const memory_1 = require("./memory");
const bufferConstructor_1 = require("./bufferConstructor");
const kdTree_1 = require("./kdTree");
const main_1 = require("./main");
class mapLayer {
    constructor(pointStrips, ids) {
        this.featureCount = 0;
        let outlineData = bufferConstructor_1.bufferConstructor.outlineBuffer(pointStrips);
        let polygonData = bufferConstructor_1.bufferConstructor.polygonBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        this.polygons = polygonData.buffer;
        let features = [];
        for (let i = 0; i < pointStrips.length; i++) {
            features.push(new feature_1.Feature(pointStrips[i], ids[i], new memory_1.GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]), new memory_1.GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
        this.featureTree = new kdTree_1.KDTree([], new kdTree_1.boundingBox(0, 0, 4, 4));
    }
    addFeatures(pointStrips, ids) {
        this.featureCount += pointStrips.length;
        main_1.setDisplayData(this.featureCount);
        let outlineMemoryPointers = bufferConstructor_1.bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines);
        let polygonMemoryPointers = bufferConstructor_1.bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons);
        for (let i = 0; i < outlineMemoryPointers.offsets.length; i++) {
            this.featureTree.insert(new feature_1.Feature(pointStrips[i], ids[i], new memory_1.GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]), new memory_1.GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])));
        }
    }
    select(x, y) {
        return this.featureTree.find(x, y)[0];
    }
    selectRectangle(bBox) {
        return this.featureTree.findSelection(bBox);
    }
    remove(x, y) {
        let removed = this.featureTree.popFirst(x, y);
        this.polygons.remove(removed.polygon);
        this.outlines.remove(removed.outline);
    }
    setStyle(feature, style) {
        if (feature === undefined) {
            console.warn("feature was undefined");
            return;
        }
        let styleData = new Int32Array(feature.outline.GPUWidth);
        for (let i = 0; i < styleData.length; i++) {
            styleData[i] = style;
        }
        if (feature.outline instanceof memory_1.GPUMemoryPointer) {
            feature.outline = feature.outline.toMemoryObject([new Float32Array(), new Float32Array(), styleData]);
        }
        else {
            feature.outline.GPUData[2] = styleData;
        }
        this.outlines.update(feature.outline, 2);
        styleData = new Int32Array(feature.polygon.GPUWidth);
        for (let i = 0; i < styleData.length; i++) {
            styleData[i] = style;
        }
        if (feature.polygon instanceof memory_1.GPUMemoryPointer) {
            feature.polygon = feature.polygon.toMemoryObject([new Float32Array(), styleData]);
        }
        else {
            feature.polygon.GPUData[1] = styleData;
        }
        this.polygons.update(feature.polygon, 1);
    }
}
exports.mapLayer = mapLayer;
