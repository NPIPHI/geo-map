export declare function lineBuffer(pointStrips: Float32Array[]): {
    vertexBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    length: number;
};
export declare function polygonBuffer(pointStrips: Float32Array[]): {
    vertexBuffer: WebGLBuffer;
    edgeBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    length: number;
};
export declare function polyFillLineBuffer(pointStrips: Float32Array[]): {
    vertexBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    length: number;
};
export declare function quadBuffer(pointStrips: {
    x: number;
    y: number;
}[][]): {
    vertexBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    length: number;
};
