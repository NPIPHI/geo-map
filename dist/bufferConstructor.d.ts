import { GPUBufferSet, GPUMemoryObject } from "./memory";
import { BoundingBox } from "./index";
export declare class bufferConstructor {
    private xAdd;
    private xScale;
    private yAdd;
    private yScale;
    constructor(bBox: BoundingBox);
    lineBuffer(pointStrips: Float64Array[]): {
        buffer: GPUBufferSet;
        features: {
            offsets: Int32Array;
            widths: Int32Array;
        };
    };
    inPlaceOutlineBuffer(pointStrips: Float64Array[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
    inPlacePolygonBuffer(pointStrips: Float64Array[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
    featureLineBuffer(strip: Float64Array): GPUMemoryObject;
    featurePolygonBuffer(strip: Float64Array): GPUMemoryObject;
    featureOutlineBuffer(strip: Float64Array): GPUMemoryObject;
}
