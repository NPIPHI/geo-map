import { GPUBufferSet, GPUMemoryObject } from "./memory";
export declare class bufferConstructor {
    static lineBuffer(pointStrips: Float32Array[]): {
        buffer: GPUBufferSet;
        features: {
            offsets: Int32Array;
            widths: Int32Array;
        };
    };
    static polygonBuffer(pointStrips: Float32Array[]): {
        buffer: GPUBufferSet;
        features: {
            offsets: Int32Array;
            widths: Int32Array;
        };
    };
    static outlineBuffer(pointStrips: Float32Array[]): {
        buffer: GPUBufferSet;
        features: {
            offsets: Int32Array;
            widths: Int32Array;
        };
    };
    static inPlaceOutlineBuffer(pointStrips: Float32Array[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
    static inPlacePolygonBuffer(pointStrips: Float32Array[], target: GPUBufferSet): {
        offsets: Int32Array;
        widths: Int32Array;
    };
}
export declare class featureConstructor {
    static lineBuffer(strip: Float32Array): GPUMemoryObject;
    static polygonBuffer(strip: Float32Array): GPUMemoryObject;
    static outlineBuffer(strip: Float32Array): GPUMemoryObject;
}
