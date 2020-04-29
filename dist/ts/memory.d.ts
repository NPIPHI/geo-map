export declare class GPUBufferSet {
    bufferSize: number;
    head: number;
    holes: GPUMemory[];
    buffers: {
        byteSize: number;
        buffer: WebGLBuffer;
    }[];
    private constructor();
    static create(elementWidths: number[]): GPUBufferSet;
    static createFromSize(elementWidths: number[], size: number): GPUBufferSet;
    static createFromBuffers(elementWidths: number[], buffers: WebGLBuffer[], size: number): GPUBufferSet;
    remove(location: GPUMemory): void;
    removeArray(locations: GPUMemory[]): void;
    add(location: GPUMemory): void;
    addArray(locations: GPUMemory[]): void;
    private clearMemory;
    private putMemory;
    private putMemoryChunck;
    private replace;
    private swap;
}
export declare class GPUMemory {
    offset: number;
    width: number;
    data: Float32Array[] | Int32Array[];
    constructor(width: number, data: Float32Array[] | Int32Array[]);
    copyLocation(): GPUMemory;
    split(splitWidth: number): GPUMemory;
}
