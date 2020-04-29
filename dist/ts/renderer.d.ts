import { mat3 } from "gl-matrix";
export declare class mapRenderer {
    private gl;
    private polyProgam;
    private outlineProgram;
    constructor(gl: WebGL2RenderingContext);
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix?: mat3): void;
    renderPolygon2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix?: mat3, drawMode?: number): void;
    renderOutline2d(vertexBuffer: WebGLBuffer, normalBuffer: WebGLBuffer, styleBuffer: WebGLBuffer, length: number, lineThickness: number, viewMatrix?: mat3): void;
    clear(): void;
    private initShaderProgram;
    private loadShader;
}
