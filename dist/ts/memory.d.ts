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
    remove(location: GPUMemoryObject | GPUMemoryPointer): void;
    removeArray(locations: (GPUMemoryObject | GPUMemoryPointer)[]): void;
    add(location: GPUMemoryObject): void;
    addArray(locations: GPUMemoryObject[]): void;
    update(location: GPUMemoryObject, attribute?: number): void;
    private reallocateBuffers;
    private resizeBuffers;
    private zeroMemory;
    private putMemory;
    private putMemoryChunck;
    private fillHole;
    private swap;
}
export declare class GPUMemoryPointer {
    GPUOffset: number;
    GPUWidth: number;
    constructor(offset: number, width: number);
    toMemoryObject(data: (Float32Array | Int32Array)[]): GPUMemoryObject;
}
export interface GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    fromPointer(pointer: GPUMemoryPointer, data: (Float32Array | Int32Array)[]): GPUMemoryObject;
}
export declare class GPUMemoryObject {
    GPUOffset: number;
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(width: number, data: (Float32Array | Int32Array)[]);
}
