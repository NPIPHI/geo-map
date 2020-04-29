import { mat3, vec2 } from "gl-matrix"
import * as shaders from "./shaders.json"
import { camera } from "./camera"

class PolyShaderProgram {
    program: WebGLProgram
    attribLocations: {
        vertexPosition: number;
        vertexColor: number;
    };
    uniformLocations: {
        viewMatrix: number;
    }
    constructor(program: WebGLProgram, vertexPosition: WebGLUniformLocation, vertexColor: WebGLUniformLocation, viewMatrix: WebGLUniformLocation) {
        this.program = program;
        this.attribLocations = { vertexPosition: (vertexPosition as number), vertexColor: (vertexColor as number) };
        this.uniformLocations = { viewMatrix: (viewMatrix as number)};
    }
}

class OutlineShaderProgram {
    program: WebGLProgram
    attribLocations: {
        vertexPosition: number;
        vertexNormal: number;
        vertexColor: number;
    };
    uniformLocations: {
        viewMatrix: number;
        lineThickness: number;
    }
    constructor(program: WebGLProgram, vertexPosition: WebGLUniformLocation, vertexNormal: WebGLUniformLocation, vertexColor: WebGLUniformLocation, viewMatrix: WebGLUniformLocation, lineThickness: WebGLUniformLocation) {
        this.program = program;
        this.attribLocations = { vertexPosition: (vertexPosition as number), vertexNormal: (vertexNormal as number), vertexColor: (vertexColor as number) };
        this.uniformLocations = { viewMatrix: (viewMatrix as number), lineThickness: (lineThickness as number)  };
    }
}

export class mapRenderer {
    private gl: WebGL2RenderingContext;
    private polyProgam: PolyShaderProgram;
    private outlineProgram: OutlineShaderProgram;
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.polyProgam = this.initShaderProgram(shaders.polygon) as PolyShaderProgram;
        this.outlineProgram = this.initShaderProgram(shaders.outline) as OutlineShaderProgram;
    }
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix = mat3.create()): void {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.vertexPosition);
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.vertexColor);
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.vertexColor,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.viewMatrix, false, viewMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, length);
    }
    renderPolygon2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix = mat3.create(), drawMode = this.gl.TRIANGLES): void {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.vertexPosition);
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.vertexColor);
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.vertexColor,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.viewMatrix, false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderOutline2d(vertexBuffer: WebGLBuffer, normalBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, lineThickness: number, viewMatrix = mat3.create()){
        let drawMode = this.gl.TRIANGLE_STRIP
        this.gl.useProgram(this.outlineProgram.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.vertexPosition);
        this.gl.vertexAttribPointer(
            this.outlineProgram.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer); 
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.vertexNormal);
        this.gl.vertexAttribPointer(
            this.outlineProgram.attribLocations.vertexNormal,
            2,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.vertexColor);
        this.gl.vertexAttribPointer(
            this.outlineProgram.attribLocations.vertexColor,
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.outlineProgram.uniformLocations.viewMatrix, false, viewMatrix);
        this.gl.uniform1f(this.outlineProgram.uniformLocations.lineThickness, lineThickness/viewMatrix[0]); 
        this.gl.uniform1fv(this.outlineProgram.uniformLocations.lineThickness, [0,1,2,3,4,5,0,1,2,3,4,5]); 

        this.gl.drawArrays(drawMode, 0, length);
    }

    clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    private initShaderProgram(shaderSource: {type: string, fragment: string, vertex: string}): PolyShaderProgram | OutlineShaderProgram{
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, shaderSource.vertex);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, shaderSource.fragment);

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
        if(shaderSource.type == "Polygon"){
            return new PolyShaderProgram(glShader, this.gl.getAttribLocation(glShader, "worldVertexPosition"), this.gl.getAttribLocation(glShader, "vertexColor"), this.gl.getUniformLocation(glShader, "VIEW"));
        }
        if(shaderSource.type == "Outline"){
            return new OutlineShaderProgram(glShader, this.gl.getAttribLocation(glShader, "worldVertexPosition"), this.gl.getAttribLocation(glShader, "vertexNormal"), this.gl.getAttribLocation(glShader, "vertexColor"), this.gl.getUniformLocation(glShader, "VIEW"), this.gl.getUniformLocation(glShader, "THICKNESS"));
        }
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