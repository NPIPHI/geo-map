import { GPUBufferSet } from "./memory";
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
}
export declare class featureConstructor {
    static lineBuffer(strip: Float32Array): {
        width: number;
        data: (Float32Array | Int32Array)[];
    };
    static polygonBuffer(strip: Float32Array): {
        width: number;
        data: (Float32Array | Int32Array)[];
    };
    static polyFillLineBuffer(pointStrips: Float32Array[]): {
        vertexBuffer: WebGLBuffer;
        colorBuffer: WebGLBuffer;
        length: number;
    };
    static outlineBuffer(strip: Float32Array): {
        width: number;
        data: (Float32Array | Int32Array)[];
    };
}
