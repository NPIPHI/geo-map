import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { boundingBox, spatialElement } from "./kdTree";
export declare class Feature implements spatialElement {
    id: string;
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    bBox: boundingBox;
    shape: ArrayLike<number>;
    constructor(strip: ArrayLike<number>, id: string, outline: GPUMemoryObject | GPUMemoryPointer, polygon: GPUMemoryObject | GPUMemoryPointer);
    static fromPointStrip(strip: ArrayLike<number>, id: string, constructor: bufferConstructor): Feature;
}
