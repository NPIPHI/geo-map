export declare class GPUBufferSet {
    bufferSize: number;
    head: number;
    holes: Map<number, number[]>;
    buffers: {
        byteSize: number;
        buffer: WebGLBuffer;
    }[];
    private constructor();
    static create(elementWidths: number[]): GPUBufferSet;
    static createFromSize(elementWidths: number[], size: number): GPUBufferSet;
    static createFromBuffers(elementWidths: number[], buffers: WebGLBuffer[], size: number): GPUBufferSet;
    remove(location: GPUMemoryObject): void;
    removeArray(locations: GPUMemoryObject[]): void;
    add(location: GPUMemoryObject): void;
    addArray(locations: GPUMemoryObject[]): void;
    private reallocateBuffers;
    private resizeBuffers;
    private clearMemory;
    private putMemory;
    private putMemoryChunck;
    private fillHole;
    private swap;
}
export declare class GPUMemoryTest implements GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: Float32Array[] | Int32Array[];
    constructor(width: number, data: Float32Array[] | Int32Array[]);
}
export interface GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
}
