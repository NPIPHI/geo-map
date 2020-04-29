import { GPUMemoryObject } from "./memory";
export declare class feature {
    line: lineMemory;
    outline: outlineMemory;
    polygon: polygonMemory;
    constructor(outline: Float32Array);
}
declare class polygonMemory implements GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array);
}
declare class lineMemory implements GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array);
}
declare class outlineMemory implements GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(outline: Float32Array);
}
export {};
