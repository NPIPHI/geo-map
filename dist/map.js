"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("./feature");
const memory_1 = require("./memory");
const bufferConstructor_1 = require("./bufferConstructor");
const kdTree_1 = require("./kdTree");
const main_1 = require("./main");
class mapLayer {
    constructor(pointStrips, ids) {
        let outlineData = bufferConstructor_1.bufferConstructor.outlineBuffer(pointStrips);
        let polygonData = bufferConstructor_1.bufferConstructor.polygonBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        this.polygons = polygonData.buffer;
        let features = [];
        for (let i = 0; i < pointStrips.length; i++) {
            features.push(new feature_1.Feature(pointStrips[i], ids[i], new memory_1.GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]), new memory_1.GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
        this.styleTable = { polygon: [new Float32Array(128 * 4), new Float32Array(128 * 4)], outline: [new Float32Array(128 * 4), new Float32Array(128 * 4)] };
        this.featureTree = new kdTree_1.KDTree([], new kdTree_1.boundingBox(0, 0, 4, 4));
    }
    addFeatures(pointStrips, ids) {
        main_1.incrementFeatureNumberDisplay(pointStrips.length);
        let outlineMemoryPointers = bufferConstructor_1.bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines);
        let polygonMemoryPointers = bufferConstructor_1.bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons);
        for (let i = 0; i < pointStrips.length; i++) {
            this.featureTree.insert(new feature_1.Feature(pointStrips[i], ids[i], new memory_1.GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]), new memory_1.GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])));
        }
    }
    addFeature(pointStrip, id) {
        main_1.incrementFeatureNumberDisplay(1);
        let feature = feature_1.Feature.fromPointStrip(pointStrip, id);
        this.outlines.add(feature.outline);
        this.polygons.add(feature.polygon);
        this.featureTree.insert(feature);
    }
    select(x, y) {
        return this.featureTree.findFirst(x, y);
    }
    selectRectangle(bBox) {
        return this.featureTree.findSelection(bBox);
    }
    remove(x, y) {
        let removed = this.featureTree.popFirst(x, y);
        if (removed) {
            main_1.incrementFeatureNumberDisplay(-1);
            this.polygons.remove(removed.polygon);
            this.outlines.remove(removed.outline);
        }
        else {
            console.warn("No feature in selected location");
        }
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
    setStyleTable(type, zoomLevel, styleIndex, r, g, b, thickness) {
        if (type === "polygon") {
            if (zoomLevel === "in") {
                this.styleTable.polygon[0][styleIndex * 4] = r;
                this.styleTable.polygon[0][styleIndex * 4 + 1] = g;
                this.styleTable.polygon[0][styleIndex * 4 + 2] = b;
            }
            else if (zoomLevel === "out") {
                this.styleTable.polygon[1][styleIndex * 4] = r;
                this.styleTable.polygon[1][styleIndex * 4 + 1] = g;
                this.styleTable.polygon[1][styleIndex * 4 + 2] = b;
            }
        }
        else {
            if (type === "outline") {
                if (zoomLevel === "in") {
                    this.styleTable.outline[0][styleIndex * 4] = r;
                    this.styleTable.outline[0][styleIndex * 4 + 1] = g;
                    this.styleTable.outline[0][styleIndex * 4 + 2] = b;
                    this.styleTable.outline[0][styleIndex * 4 + 3] = thickness;
                }
                else if (zoomLevel === "out") {
                    this.styleTable.outline[1][styleIndex * 4] = r;
                    this.styleTable.outline[1][styleIndex * 4 + 1] = g;
                    this.styleTable.outline[1][styleIndex * 4 + 3] = thickness;
                }
            }
        }
    }
    setStyleTableFromArray(type, zoomInArray, zoomOutArray, offset = 0) {
        if (type === "polygon") {
            this.styleTable.polygon[0].set(zoomInArray, offset);
            this.styleTable.polygon[1].set(zoomOutArray, offset);
        }
        else if (type === "outline") {
            this.styleTable.outline[0].set(zoomInArray, offset);
            this.styleTable.outline[1].set(zoomOutArray, offset);
        }
    }
}
exports.mapLayer = mapLayer;
