import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { boundingBox, spatialElement } from "./kdTree";
export declare class Feature implements spatialElement {
    id: string;
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    bBox: boundingBox;
    shape: Float32Array;
    constructor(strip: Float32Array, id: string, outline: GPUMemoryObject | GPUMemoryPointer, polygon: GPUMemoryObject | GPUMemoryPointer);
    static fromPointStrip(strip: Float32Array, id: string): Feature;
}
