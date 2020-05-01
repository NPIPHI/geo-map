import { Feature } from "./feature";
import { GPUBufferSet } from "./memory";
import { boundingBox } from "./kdTree";
export declare class mapLayer {
    private featureTree;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    private featureCount;
    constructor(pointStrips: Float32Array[], ids: string[]);
    addFeatures(pointStrips: Float32Array[], ids: string[]): void;
    select(x: number, y: number): Feature | undefined;
    selectRectangle(bBox: boundingBox): Feature[];
    remove(x: number, y: number): void;
    setStyle(feature: Feature, style: number): void;
}
