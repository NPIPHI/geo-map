import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
export declare class feature {
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    constructor(outline: GPUMemoryObject | GPUMemoryPointer, polygon: GPUMemoryObject | GPUMemoryPointer);
    fromPointStrip(strip: Float32Array): void;
}
