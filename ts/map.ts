import { Feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer, GPUMemoryObject} from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { KDTree, boundingBox } from "./kdTree"

export class mapLayer{
    featureTree: KDTree;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[], ids: string[]){
        let outlineData = bufferConstructor.outlineBuffer(pointStrips);
        let polygonData = bufferConstructor.polygonBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        this.polygons = polygonData.buffer;
        let features: Feature[] = [];
        for(let i = 0; i < pointStrips.length; i++){
             features.push(new Feature(pointStrips[i], ids[i],
                                             new GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]),
                                             new GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
         
        this.featureTree = new KDTree([], new boundingBox(0, 0, 4, 4));
    }
    addFeatures(pointStrips: Float32Array[], ids: string[]){
        let outlineMemoryPointers = bufferConstructor.inPlaceOutlineBuffer(pointStrips, this.outlines)
        let polygonMemoryPointers = bufferConstructor.inPlacePolygonBuffer(pointStrips, this.polygons)
        for(let i = 0; i < outlineMemoryPointers.offsets.length; i++){
            this.featureTree.insert(new Feature(pointStrips[i], ids[i],
                new GPUMemoryPointer(outlineMemoryPointers.offsets[i], outlineMemoryPointers.widths[i]),
                new GPUMemoryPointer(polygonMemoryPointers.offsets[i], polygonMemoryPointers.widths[i])))
        }
    }
    select(x: number, y: number): Feature | undefined{
        return this.featureTree.find(x, y)[0] as Feature;
    }
    selectRectangle(bBox: boundingBox): Feature[]{
        return this.featureTree.findSelection(bBox) as Feature[];
    }
    remove(x: number, y: number): void {
        let removed = this.featureTree.popFirst(x, y) as Feature;
        this.polygons.remove(removed.polygon);
        this.outlines.remove(removed.outline)
    }
    setStyle(feature: Feature, style: number){
        if(feature === undefined){
            console.warn("feature was undefined");
            return
        }
        let styleData = new Int32Array(feature.outline.GPUWidth);
        for(let i = 0; i < styleData.length; i++){
            styleData[i] = style;
        }
        if(feature.outline instanceof GPUMemoryPointer){
            feature.outline = feature.outline.toMemoryObject([new Float32Array(), new Float32Array(), styleData]);
        } else {
            feature.outline.GPUData[2] = styleData;
        }
        this.outlines.update(feature.outline, 2);


        styleData = new Int32Array(feature.polygon.GPUWidth);
        for(let i = 0; i < styleData.length; i++){
            styleData[i] = style;
        }
        if(feature.polygon instanceof GPUMemoryPointer){
            feature.polygon = feature.polygon.toMemoryObject([new Float32Array(), styleData]);
        } else {
            feature.polygon.GPUData[1] = styleData;
        }
        this.polygons.update(feature.polygon, 1);
    }
}