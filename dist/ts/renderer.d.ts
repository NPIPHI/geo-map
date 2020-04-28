import { mat3 } from "gl-matrix";
declare class ShaderProgram {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
        edgeDistance: number;
        vertexColor: number;
    };
    uniformLocations: {
        viewMatrix: number;
    };
    constructor(program: WebGLProgram, vertexPosition: WebGLUniformLocation, edgeDistance: WebGLUniformLocation, vertexColor: WebGLUniformLocation, viewMatrix: WebGLUniformLocation);
}
export declare class mapRenderer {
    gl: WebGL2RenderingContext;
    program: ShaderProgram;
    constructor(gl: WebGL2RenderingContext);
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix?: mat3): void;
    renderPolygon2d(vertexBuffer: WebGLBuffer, edgeBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix?: mat3, drawMode?: number): void;
    clear(): void;
    private initShaderProgram;
    private loadShader;
}
export {};
