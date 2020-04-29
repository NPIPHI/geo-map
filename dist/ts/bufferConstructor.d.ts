import { GPUMemoryObject } from "./memory";
export declare class bufferConstructor {
    static lineBuffer(pointStrips: Float32Array[]): {
        vertexBuffer: WebGLBuffer;
        colorBuffer: WebGLBuffer;
        length: number;
    };
    static polygonBuffer(pointStrips: Float32Array[]): {
        vertexBuffer: WebGLBuffer;
        colorBuffer: WebGLBuffer;
        length: number;
    };
    static polyFillLineBuffer(pointStrips: Float32Array[]): {
        vertexBuffer: WebGLBuffer;
        colorBuffer: WebGLBuffer;
        length: number;
    };
    static outlineBuffer(pointStrips: Float32Array[]): {
        vertexBuffer: WebGLBuffer;
        normalBuffer: WebGLBuffer;
        styleBuffer: WebGLBuffer;
        length: number;
    };
    static bufferSetTest(pointStrips: Float32Array[]): GPUMemoryObject[];
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
