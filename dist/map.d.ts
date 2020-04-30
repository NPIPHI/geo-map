import { Feature } from "./feature";
import { GPUBufferSet } from "./memory";
import { KDTree } from "./kdTree";
export declare class mapLayer {
    featureTree: KDTree;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[], ids: string[]);
    addFeatures(pointStrips: Float32Array[], ids: string[]): void;
    select(x: number, y: number): Feature | undefined;
    remove(x: number, y: number): void;
    setStyle(feature: Feature, style: number): void;
}
