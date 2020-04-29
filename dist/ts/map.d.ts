import { feature } from "./feature";
import { GPUBufferSet } from "./memory";
export declare class geoMap {
    features: feature[];
    lines: GPUBufferSet;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]);
    draw(viewMatrix: Float32Array): void;
}
