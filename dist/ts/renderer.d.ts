import { GPUBufferSet } from "./memory";
import { geoMap } from "./map";
export declare class mapRenderer {
    private gl;
    private polyProgam;
    private outlineProgram;
    constructor(gl: WebGL2RenderingContext);
    renderMap(map: geoMap, viewMatrix: Float32Array): void;
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array): void;
    renderLine2dFromBuffer(bufferset: GPUBufferSet, viewMatrix: Float32Array): void;
    renderPolygon2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array, drawMode?: number): void;
    renderPolygon2dFromBuffer(bufferSet: GPUBufferSet, viewMatrix: Float32Array): void;
    renderOutline2d(vertexBuffer: WebGLBuffer, normalBuffer: WebGLBuffer, styleBuffer: WebGLBuffer, length: number, lineThickness: number, viewMatrix: Float32Array): void;
    renderOutline2dFromBuffer(bufferSet: GPUBufferSet, lineThickness: number, viewMatrix: Float32Array): void;
    clear(): void;
    private initShaderProgram;
    private loadShader;
}
