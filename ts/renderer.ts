import * as shaders from "./shaders.json"
import { camera } from "./camera"
import { GPUBufferSet } from "./memory";
import { geoMap } from "./map";

class ShaderProgram {
    program: WebGLProgram;
    attribLocations: Map<string, number>;
    uniformLocations: Map<string, number>;
    constructor(program: WebGLProgram, attributeLocations: Map<string, number>, uniformLocations: Map<string, number>){
        this.program = program;
        this.attribLocations = attributeLocations;
        this.uniformLocations = uniformLocations;
    }
}

export class mapRenderer {
    private gl: WebGL2RenderingContext;
    private polyProgam: ShaderProgram;
    private outlineProgram: ShaderProgram;
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.polyProgam = this.initShaderProgram(shaders.polygon);
        this.outlineProgram = this.initShaderProgram(shaders.outline);
    }
    renderMap(map: geoMap, viewMatrix: Float32Array){
        this.renderLine2dFromBuffer(map.lines, viewMatrix);
        //this.renderOutline2dFromBuffer(map.outlines, 0.001, viewMatrix);
        this.renderPolygon2dFromBuffer(map.polygons, viewMatrix);
    }
    renderLine2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array): void {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.get("vertexPosition"),
            2,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexColor"));
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.get("vertexColor"),
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, length);
    }
    renderLine2dFromBuffer(bufferset: GPUBufferSet, viewMatrix: Float32Array): void {
        this.renderLine2d(bufferset.buffers[0].buffer, bufferset.buffers[1].buffer, bufferset.head, viewMatrix);
    }
    renderPolygon2d(vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer, length: number, viewMatrix: Float32Array, drawMode = this.gl.TRIANGLES): void {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.get("vertexPosition"),
            2,
            this.gl.FLOAT,
            false,
            0,
            0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexColor"));
        this.gl.vertexAttribPointer(
            this.polyProgam.attribLocations.get("vertexColor"),
            3,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderPolygon2dFromBuffer(bufferSet: GPUBufferSet, viewMatrix: Float32Array): void {
        this.renderPolygon2d(bufferSet.buffers[0].buffer, bufferSet.buffers[1].buffer, bufferSet.head, viewMatrix);
    }
    renderOutline2d(vertexBuffer: WebGLBuffer, normalBuffer: WebGLBuffer, styleBuffer: WebGLBuffer, length: number, lineThickness: number, viewMatrix: Float32Array){
        let drawMode = this.gl.TRIANGLE_STRIP
        this.gl.useProgram(this.outlineProgram.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(
            this.outlineProgram.attribLocations.get("vertexPosition"),
            2,
            this.gl.FLOAT,
            false,
            0,
            0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer); 
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexNormal"));
        this.gl.vertexAttribPointer(
            this.outlineProgram.attribLocations.get("vertexNormal"),
            2,
            this.gl.FLOAT,
            false,
            0,
            0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, styleBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexStyle"));
        // this.gl.vertexAttribPointer(
        //     this.outlineProgram.attribLocations.get("vertexStyle"),
        //     1,
        //     this.gl.INT,
        //     false,
        //     0,
        //     0);

        this.gl.vertexAttribIPointer(
            this.outlineProgram.attribLocations.get("vertexStyle"),
            1,
            this.gl.INT,
            0,
            0);

        let styledata = new Float32Array([1, 0, 0, lineThickness/viewMatrix[0], 0, 1, 0, 3*lineThickness/viewMatrix[0]]);
        
        this.gl.uniformMatrix3fv(this.outlineProgram.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.uniform4fv(this.outlineProgram.uniformLocations.get("STYLETABLE"), styledata);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderOutline2dFromBuffer(bufferSet: GPUBufferSet, lineThickness: number, viewMatrix: Float32Array){
        this.renderOutline2d(bufferSet.buffers[0].buffer, bufferSet.buffers[1].buffer, bufferSet.buffers[2].buffer, bufferSet.head, lineThickness, viewMatrix)
    }
    clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    private initShaderProgram(shaderSource: {type: string, fragment: string, vertex: string, attributes: string[], uniforms: string[]}): ShaderProgram{
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
        let attribLocations: Map<string, number> = new Map();
        shaderSource.attributes.forEach(attribute=>attribLocations.set(attribute, this.gl.getAttribLocation(glShader, attribute)));

        let uniformLocations: Map<string, number> = new Map();
        shaderSource.uniforms.forEach(uniform=>uniformLocations.set(uniform, this.gl.getUniformLocation(glShader, uniform) as number));

        return new ShaderProgram(glShader, attribLocations, uniformLocations);
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