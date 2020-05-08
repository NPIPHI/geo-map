import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { boundingBox, spatialElement } from "./kdTree";
export declare class Feature implements spatialElement {
    id: string;
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    bBox: boundingBox;
    shape: Float64Array;
    constructor(strip: Float64Array, id: string, outline: GPUMemoryObject | GPUMemoryPointer, polygon: GPUMemoryObject | GPUMemoryPointer);
    static fromPointStrip(strip: Float64Array, id: string, constructor: bufferConstructor): Feature;
}
