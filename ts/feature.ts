import { GPUMemoryObject, GPUMemoryTest } from "./memory";
import { featureConstructor } from "./bufferConstructor"

export class feature {
    line: lineMemory;
    outline: outlineMemory;
    polygon: polygonMemory;
    constructor(outline: Float32Array){
        this.line = new lineMemory(outline);
        this.outline = new outlineMemory(outline);
        this.polygon = new polygonMemory(outline);
    }
}

class polygonMemory implements GPUMemoryObject{
    GPUOffset: number = -1;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array){
        let GPUinfo = featureConstructor.polygonBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}
class lineMemory implements GPUMemoryObject{
    GPUOffset: number = -1;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array){
        let GPUinfo = featureConstructor.lineBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}

class outlineMemory implements GPUMemoryObject {
    GPUOffset: number = -1;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array){
        let GPUinfo = featureConstructor.outlineBuffer(outline);
        this.GPUWidth = GPUinfo.width;
        this.GPUData = GPUinfo.data;
    }
}