import { Feature } from "./feature";
import { GPUBufferSet } from "./memory";
export declare class geoMap {
    features: Feature[];
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]);
    select(x: number, y: number): Feature;
    remove(feature: Feature | number): void;
}
