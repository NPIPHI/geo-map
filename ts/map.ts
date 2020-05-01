import { Feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer, GPUMemoryObject } from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { KDTree, boundingBox } from "./kdTree"
import { incrementFeatureNumberDisplay } from "./main"

export class mapLayer {
    private featureTree: KDTree;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    styleTable: { polygon: Float32Array[], outline: Float32Array[] };

    constructor(pointStrips: Float32Array[], ids: string[]) {
        let outlineData = bufferConstructor.outlineBuffer(pointStrips);
        let polygonData = bufferConstructor.polygonBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        this.polygons = polygonData.buffer;
        let features: Feature[] = [];
        for (let i = 0; i < pointStrips.length; i++) {
            features.push(new Feature(pointStrips[i], ids[i],
                new GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]),
                new GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
        this.styleTable = { polygon: [new Float32Array(128 * 4), new Float32Array(128 * 4)], outline: [new Float32Array(128 * 4), new Float32Array(128 * 4)] }
        this.featureTree = new KDTree([], new boundingBox(0, 0, 4, 4));
    }
    addFeatures(pointStrips: Float32Array[], ids: string[]) {
        incrementFeatureNumberDisplay(pointStrips.length);
        let outlineMemoryPointers = bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines)
        let polygonMemoryPointers = bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons)
        for (let i = 0; i < outlineMemoryPointers.offsets.length; i++) {
            this.featureTree.insert(new Feature(pointStrips[i], ids[i],
                new GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]),
                new GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])))
        }
    }
    addFeature(pointStrip: Float32Array, id: string){
        incrementFeatureNumberDisplay(1);
        let feature = Feature.fromPointStrip(pointStrip, id);
        this.outlines.add(feature.outline as GPUMemoryObject);
        this.polygons.add(feature.polygon as GPUMemoryObject);
        this.featureTree.insert(feature);
    }
    select(x: number, y: number): Feature | undefined {
        return this.featureTree.findFirst(x, y) as Feature;
    }
    selectRectangle(bBox: boundingBox): Feature[] {
        return this.featureTree.findSelection(bBox) as Feature[];
    }
    remove(x: number, y: number): void {
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