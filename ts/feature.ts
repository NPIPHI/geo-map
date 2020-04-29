import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { featureConstructor } from "./bufferConstructor"

export class feature {
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    constructor(outline:  GPUMemoryObject | GPUMemoryPointer, polygon:  GPUMemoryObject | GPUMemoryPointer){
        this.outline = outline;
        this.polygon = polygon;
    }
    fromPointStrip(strip: Float32Array){
        this.outline = featureConstructor.outlineBuffer(strip);
        this.polygon = featureConstructor.polygonBuffer(strip);
    }
}