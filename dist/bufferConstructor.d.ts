import { GPUBufferSet, GPUMemoryObject } from "./memory";
import { BoundingBox } from "./index";
export declare class bufferConstructor {
    private xAdd;
    private xScale;
    private yAdd;
    private yScale;
    constructor(bBox: BoundingBox);
    lineBuffer(pointStrips: ArrayLike<number>[]): {
        buffer: GPUBufferSet;
        features: {
            offsets: Int32Array;
            widths: Int32Array;
        };
    };
    inPlaceOutlineBuffer(pointStrips: ArrayLike<number>[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
    inPlacePolygonBuffer(pointStrips: ArrayLike<number>[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
    featurePolygonBuffer(strip: ArrayLike<number>, style?: number): GPUMemoryObject;
    featureOutlineBuffer(strip: ArrayLike<number>, style?: number): GPUMemoryObject;
}
