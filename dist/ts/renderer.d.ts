import { GPUBufferSet } from "./memory";
import { mapLayer } from "./map";
export declare class mapRenderer {
    private gl;
    private polyProgam;
    private outlineProgram;
    private styleTransitionBoundry;
    constructor(gl: WebGL2RenderingContext);
    setTransitionBoundry(min: number, max: number): void;
    private getTransitionScalar;
    renderMap(map: mapLayer, viewMatrix: Float32Array, poly: boolean, outline: boolean): void;
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array): void;
    renderLine2dFromBuffer(bufferset: GPUBufferSet, viewMatrix: Float32Array): void;
    renderPolygon2d(vertexBuffer: WebGLBuffer, styleBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array, drawMode?: number): void;
    renderPolygon2dFromBuffer(bufferSet: GPUBufferSet, viewMatrix: Float32Array): void;
    renderOutline2d(vertexBuffer: WebGLBuffer, normalBuffer: WebGLBuffer, styleBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array): void;
    renderOutline2dFromBuffer(bufferSet: GPUBufferSet, viewMatrix: Float32Array): void;
    clear(): void;
    private initShaderProgram;
    private loadShader;
}
