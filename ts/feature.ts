import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { featureConstructor } from "./bufferConstructor"
import { boundingBox, spatialElement } from "./kdTree"

export class Feature implements spatialElement{
    id: string;
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    bBox: boundingBox;
    shape: Float32Array;
    constructor(strip: Float32Array, id: string, outline:  GPUMemoryObject | GPUMemoryPointer, polygon:  GPUMemoryObject | GPUMemoryPointer){
        this.id = id;
        this.bBox = boundingBox.fromStrip(strip);
        this.outline = outline;
        this.polygon = polygon;
        this.shape = strip;
    }
    static fromPointStrip(strip: Float32Array, id: string): Feature{
        return new Feature(strip, id, featureConstructor.outlineBuffer(strip), featureConstructor.polygonBuffer(strip));
    }
}