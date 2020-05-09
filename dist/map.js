"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_1 = require("./feature");
const memory_1 = require("./memory");
const kdTree_1 = require("./kdTree");
class mapLayer {
    constructor(name, bBox, bufferConstructor, invalidateCallback, zIndex = 0) {
        this.hoverListeners = [];
        this.mouseoverListeners = [];
        this.pointerdownListeners = [];
        this.pointerupListeners = [];
        this.name = name;
        this.bBox = bBox;
        this.zIndex = zIndex;
        this.outlines = memory_1.GPUBufferSet.create([2 * 4, 2 * 4, 1 * 4]);
        this.polygons = memory_1.GPUBufferSet.create([2 * 4, 1 * 4]);
        this.invalidateCallback = invalidateCallback;
        this.styleTable = { polygon: [new Float32Array(128 * 4), new Float32Array(128 * 4)], outline: [new Float32Array(128 * 4), new Float32Array(128 * 4)] };
        this.featureTree = new kdTree_1.BinarySpaceTree(new kdTree_1.boundingBox(bBox.x1, bBox.y1, bBox.x2, bBox.y2));
        this.bufferConstructor = bufferConstructor;
    }
    addEventListener(type, callback) {
        if (type === "hover") {
            this.hoverListeners.push(callback);
        }
        if (type === "mouseover") {
            this.mouseoverListeners.push(callback);
        }
        if (type === "pointerdown") {
            this.pointerdownListeners.push(callback);
        }
        if (type === "pointerup") {
            this.pointerupListeners.push(callback);
        }
    }
    callEventListener(type, point) {
        let selectedFeature = this.selectByPoint(point.x, point.y);
        if (type === "hover") {
            this.hoverListeners.forEach(listener => listener(selectedFeature));
        }
        if (type === "mouseover") {
            this.mouseoverListeners.forEach(listener => listener(selectedFeature));
        }
        if (type === "pointerdown") {
            this.pointerdownListeners.forEach(listener => listener(selectedFeature));
        }
        if (type === "pointerup") {
            this.pointerupListeners.forEach(listener => listener(selectedFeature));
        }
    }
    addFeatures(pointStrips, ids) {
        let outlineMemoryPointers = this.bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines);
        let polygonMemoryPointers = this.bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons);
        for (let i = 0; i < pointStrips.length; i++) {
            this.featureTree.insert(new feature_1.Feature(pointStrips[i], ids[i], new memory_1.GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]), new memory_1.GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])));
        }
        this.invalidateCallback();
    }
    addFeature(pointStrip, id) {
        let feature = feature_1.Feature.fromPointStrip(pointStrip, id, this.bufferConstructor);
        this.outlines.add(feature.outline);
        this.polygons.add(feature.polygon);
        this.featureTree.insert(feature);
        this.invalidateCallback();
    }
    selectByPoint(x, y) {
        return this.featureTree.findFirst(x, y);
    }
    selectByRectangle(bBox) {
        return this.featureTree.findSelection(bBox);
    }
    selectByID(id) {
        return this.featureTree.findID(id);
    }
    remove(feature) {
        this.featureTree.remove(feature);
        this.invalidateCallback();
    }
    popByPoint(x, y) {
        let removed = this.featureTree.popFirst(x, y);
        if (removed) {
            this.polygons.remove(removed.polygon);
            this.outlines.remove(removed.outline);
        }
        else {
            console.warn("No feature in selected location");
        }
        this.invalidateCallback();
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
        this.invalidateCallback();
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
        this.invalidateCallback();
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
        this.invalidateCallback();
    }
}
exports.mapLayer = mapLayer;
