import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
export declare class Feature {
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    boundingBox: boundingBox;
    constructor(strip: Float32Array, outline: GPUMemoryObject | GPUMemoryPointer, polygon: GPUMemoryObject | GPUMemoryPointer);
    fromPointStrip(strip: Float32Array): void;
}
declare class boundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(points: Float32Array);
    contains(x: number, y: number): boolean;
}
export {};
