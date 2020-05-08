import { Feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer, GPUMemoryObject } from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { BinarySpaceTree, boundingBox } from "./kdTree";
import { incrementFeatureNumberDisplay } from "./main";
import { Layer, BoundingBox } from "./index";

export class mapLayer implements Layer{
    private featureTree: BinarySpaceTree<Feature>;
    private bufferConstructor: bufferConstructor;
    private bBox: BoundingBox;
    private hoverListeners: ((arg0: Feature)=>void)[];
    private mouseoverListeners: ((arg0: Feature)=>void)[];
    private pointerdownListeners: ((arg0: Feature)=>void)[];
    private pointerupListeners: ((arg0: Feature)=>void)[];
    zIndex: number;
    name: string;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    styleTable: { polygon: Float32Array[], outline: Float32Array[] };

    constructor(name: string, bBox: BoundingBox, bufferConstructor: bufferConstructor, zIndex = 0) {
        this.name = name;
        this.bBox = bBox;
        this.zIndex = zIndex;
        this.outlines = GPUBufferSet.create([2*4, 2*4, 1*4]);
        this.polygons = GPUBufferSet.create([2*4, 1*4]);
        this.styleTable = { polygon: [new Float32Array(128 * 4), new Float32Array(128 * 4)], outline: [new Float32Array(128 * 4), new Float32Array(128 * 4)] }
        this.featureTree = new BinarySpaceTree(new boundingBox(bBox.x1, bBox.y1, bBox.x2, bBox.y2));
        this.bufferConstructor = bufferConstructor
    }
    addEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", callback: (arg0: Feature)=>void){
        if(type === "hover"){
            this.hoverListeners.push(callback);
        }
        if(type === "mouseover"){
            this.mouseoverListeners.push(callback);
        }
        if(type === "pointerdown"){
            this.pointerdownListeners.push(callback);
        }
        if(type === "pointerup"){
            this.pointerupListeners.push(callback);
        }
    }
    callEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", point: {x: number, y: number}){
        let selectedFeature = this.selectByPoint(point.x, point.y);
        if(type === "hover"){
            this.hoverListeners.forEach(listener=>listener(selectedFeature))
        }
        if(type === "mouseover"){
            this.mouseoverListeners.forEach(listener=>listener(selectedFeature))
        }
        if(type === "pointerdown"){
            this.pointerdownListeners.forEach(listener=>listener(selectedFeature))
        }
        if(type === "pointerup"){
            this.pointerupListeners.forEach(listener=>listener(selectedFeature))
        }
    }
    addFeatures(pointStrips: Float64Array[], ids: string[]) {
        incrementFeatureNumberDisplay(pointStrips.length);
        let outlineMemoryPointers = this.bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines)
        let polygonMemoryPointers = this.bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons)
        for (let i = 0; i < pointStrips.length; i++) {
            this.featureTree.insert(new Feature(pointStrips[i], ids[i],
                new GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]),
                new GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])))
        }
    }
    addFeature(pointStrip: Float64Array, id: string){
        incrementFeatureNumberDisplay(1);
        let feature = Feature.fromPointStrip(pointStrip, id, this.bufferConstructor);
        this.outlines.add(feature.outline as GPUMemoryObject);
        this.polygons.add(feature.polygon as GPUMemoryObject);
        this.featureTree.insert(feature);
    }
    selectByPoint(x: number, y: number): Feature | undefined {
        return this.featureTree.findFirst(x, y) as Feature;
    }
    selectByRectangle(bBox: boundingBox): Feature[] {
        return this.featureTree.findSelection(bBox);
    }
    selectByID(id: string): Feature {
        return this.featureTree.findID(id);
    }
    remove(feature: Feature): void {
        this.featureTree.remove(feature);
    }
    popByPoint(x: number, y: number): void {
        let removed = this.featureTree.popFirst(x, y) as Feature;
        if (removed) {
            incrementFeatureNumberDisplay(-1);
            this.polygons.remove(removed.polygon);
            this.outlines.remove(removed.outline);
        } else {
            console.warn("No feature in selected location")
        }
    }
    setStyle(feature: Feature, style: number) {
        if (feature === undefined) {
            console.warn("feature was undefined");
            return
        }
        let styleData = new Int32Array(feature.outline.GPUWidth);
        for (let i = 0; i < styleData.length; i++) {
            styleData[i] = style;
        }
        if (feature.outline instanceof GPUMemoryPointer) {
            feature.outline = feature.outline.toMemoryObject([new Float32Array(), new Float32Array(), styleData]);
        } else {
            feature.outline.GPUData[2] = styleData;
        }
        this.outlines.update(feature.outline, 2);


        styleData = new Int32Array(feature.polygon.GPUWidth);
        for (let i = 0; i < styleData.length; i++) {
            styleData[i] = style;
        }
        if (feature.polygon instanceof GPUMemoryPointer) {
            feature.polygon = feature.polygon.toMemoryObject([new Float32Array(), styleData]);
        } else {
            feature.polygon.GPUData[1] = styleData;
        }
        this.polygons.update(feature.polygon, 1);
    }
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void {
        if (type === "polygon") {
            if (zoomLevel === "in") {
                this.styleTable.polygon[0][styleIndex * 4] = r;
                this.styleTable.polygon[0][styleIndex * 4 + 1] = g;
                this.styleTable.polygon[0][styleIndex * 4 + 2] = b;
            } else if (zoomLevel === "out") {
                this.styleTable.polygon[1][styleIndex * 4] = r;
                this.styleTable.polygon[1][styleIndex * 4 + 1] = g;
                this.styleTable.polygon[1][styleIndex * 4 + 2] = b;
            }
        } else {
            if (type === "outline") {
                if (zoomLevel === "in") {
                    this.styleTable.outline[0][styleIndex * 4] = r;
                    this.styleTable.outline[0][styleIndex * 4 + 1] = g;
                    this.styleTable.outline[0][styleIndex * 4 + 2] = b;
                    this.styleTable.outline[0][styleIndex * 4 + 3] = thickness;
                } else if (zoomLevel === "out") {
                    this.styleTable.outline[1][styleIndex * 4] = r;
                    this.styleTable.outline[1][styleIndex * 4 + 1] = g;
                    this.styleTable.outline[1][styleIndex * 4 + 3] = thickness;
                }
            }
        }
    }
    setStyleTableFromArray(type: "polygon" | "outline", zoomInArray: ArrayLike<number>, zoomOutArray: ArrayLike<number>, offset: number = 0) {
        if(type === "polygon"){
            this.styleTable.polygon[0].set(zoomInArray, offset);
            this.styleTable.polygon[1].set(zoomOutArray, offset);
        } else if(type === "outline"){
            this.styleTable.outline[0].set(zoomInArray, offset);
            this.styleTable.outline[1].set(zoomOutArray, offset);
        }
    }
}