import { mat3, vec2 } from "gl-matrix"
import * as shaders from "./shaders.json"
import { camera } from "./camera"

class ShaderProgram {
    program: WebGLProgram
    attribLocations: {
        vertexPosition: number;
        edgeDistance: number;
        vertexColor: number;
    };
    uniformLocations: {
        viewMatrix: number;
    }
    constructor(program: WebGLProgram, vertexPosition: WebGLUniformLocation, edgeDistance: WebGLUniformLocation, vertexColor: WebGLUniformLocation, viewMatrix: WebGLUniformLocation) {
        this.program = program;
        this.attribLocations = { vertexPosition: (vertexPosition as number), edgeDistance: (edgeDistance as number), vertexColor: (vertexColor as number) };
        this.uniformLocations = { viewMatrix: (viewMatrix as number) };
    }
}

export class mapRenderer {
    gl: WebGL2RenderingContext;
    program: ShaderProgram;
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.program = this.initShaderProgram(shaders.vertex, shaders.fragment);
    }
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix = mat3.create()): void {
        this.gl.useProgram(this.program.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.program.attribLocations.vertexPosition);
        this.gl.vertexAttribPointer(
            this.program.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.program.attribLocations.vertexColor);
        this.gl.vertexAttribPointer(
            this.program.attribLocations.vertexColor,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.program.uniformLocations.viewMatrix, false, viewMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, length);
    }
    renderPolygon2d(vertexBuffer: WebGLBuffer, edgeBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix = mat3.create(), drawMode = this.gl.TRIANGLES): void {
        this.gl.useProgram(this.program.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.program.attribLocations.vertexPosition);
        this.gl.vertexAttribPointer(
            this.program.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, edgeBuffer);
        this.gl.enableVertexAttribArray(this.program.attribLocations.edgeDistance);
        this.gl.vertexAttribPointer(
            this.program.attribLocations.edgeDistance,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.program.attribLocations.vertexColor);
        this.gl.vertexAttribPointer(
            this.program.attribLocations.vertexColor,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.program.uniformLocations.viewMatrix, false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    private initShaderProgram(vsSource: string, fsSource: string): ShaderProgram {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        const glShader = this.gl.createProgram();
        this.gl.attachShader(glShader, vertexShader);
        this.gl.attachShader(glShader, fragmentShader);
        this.gl.linkProgram(glShader);

        // If creating the shader program failed, alert

        if (!this.gl.getProgramParameter(glShader, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(glShader));
            return null;
        }

        return new ShaderProgram(glShader, this.gl.getAttribLocation(glShader, "worldVertexPosition"), this.gl.getAttribLocation(glShader, "edgeDistance"), this.gl.getAttribLocation(glShader, "vertexColor"), this.gl.getUniformLocation(glShader, "VIEW"));
    }

    private loadShader(type: GLenum, source: string): WebGLShader {
        const shader = this.gl.createShader(type);

        // Send the source to the shader object

        this.gl.shaderSource(shader, source);

        // Compile the shader program

        this.gl.compileShader(shader);

        // See if it compiled successfully

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}