export declare class GPUBufferSet {
    bufferSize: number;
    head: number;
    holes: memoryLocation[];
    buffers: {
        byteSize: number;
        buffer: WebGLBuffer;
    }[];
    constructor(elementWidths: number[], bufferSize: number);
    remove(location: memoryLocation): void;
    add(location: memoryLocation): void;
    private clearMemory;
    private putMemory;
    private replace;
    private swap;
}
export declare class memoryLocation {
    offset: number;
    width: number;
    data: Float32Array[] | Int32Array[];
    constructor(width: number, data: Float32Array[] | Int32Array[]);
    split(splitWidth: number): memoryLocation;
}
