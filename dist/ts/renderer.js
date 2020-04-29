"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
const shaders = __importStar(require("./shaders.json"));
class PolyShaderProgram {
    constructor(program, vertexPosition, vertexColor, viewMatrix) {
        this.program = program;
        this.attribLocations = { vertexPosition: vertexPosition, vertexColor: vertexColor };
        this.uniformLocations = { viewMatrix: viewMatrix };
    }
}
class OutlineShaderProgram {
    constructor(program, vertexPosition, vertexNormal, vertexColor, viewMatrix, lineThickness) {
        this.program = program;
        this.attribLocations = { vertexPosition: vertexPosition, vertexNormal: vertexNormal, vertexColor: vertexColor };
        this.uniformLocations = { viewMatrix: viewMatrix, lineThickness: lineThickness };
    }
}
class ShaderProgram {
    constructor(program, attributeLocations, uniformLocations) {
        this.program = program;
        this.attribLocations = attributeLocations;
        this.uniformLocations = uniformLocations;
    }
}
class mapRenderer {
    constructor(gl) {
        this.gl = gl;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.polyProgam = this.initShaderProgram(shaders.polygon);
        this.outlineProgram = this.initShaderProgram(shaders.outline);
    }
    renderLine2d(vertexBuffer, colorBuffer, length, viewMatrix = gl_matrix_1.mat3.create()) {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexColor"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexColor"), 3, this.gl.FLOAT, false, 0, 0);
        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, length);
    }
    renderPolygon2d(vertexBuffer, colorBuffer, length, viewMatrix = gl_matrix_1.mat3.create(), drawMode = this.gl.TRIANGLES) {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexColor"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexColor"), 3, this.gl.FLOAT, false, 0, 0);
        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderPolygon2dFromBuffer(bufferSet, viewMatrix) {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferSet.buffers[0].buffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferSet.buffers[1].buffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexColor"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexColor"), 3, this.gl.FLOAT, false, 0, 0);
        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, bufferSet.head);
    }
    renderOutline2d(vertexBuffer, normalBuffer, styleBuffer, length, lineThickness, viewMatrix = gl_matrix_1.mat3.create()) {
        let drawMode = this.gl.TRIANGLE_STRIP;
        this.gl.useProgram(this.outlineProgram.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(this.outlineProgram.attribLocations.get("vertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexNormal"));
        this.gl.vertexAttribPointer(this.outlineProgram.attribLocations.get("vertexNormal"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, styleBuffer);
        this.gl.enableVertexAttribArray(this.outlineProgram.attribLocations.get("vertexStyle"));
        this.gl.vertexAttribIPointer(this.outlineProgram.attribLocations.get("vertexStyle"), 1, this.gl.INT, 0, 0);
        let styledata = new Float32Array([1, 0, 0, lineThickness / viewMatrix[0], 0, 1, 0, 3 * lineThickness / viewMatrix[0]]);
        this.gl.uniformMatrix3fv(this.outlineProgram.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.uniform4fv(this.outlineProgram.uniformLocations.get("STYLETABLE"), styledata);
        this.gl.drawArrays(drawMode, 0, length);
    }
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    initShaderProgram(shaderSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, shaderSource.vertex);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, shaderSource.fragment);
        const glShader = this.gl.createProgram();
        this.gl.attachShader(glShader, vertexShader);
        this.gl.attachShader(glShader, fragmentShader);
        this.gl.linkProgram(glShader);
        if (!this.gl.getProgramParameter(glShader, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(glShader));
            return null;
        }
        let attribLocations = new Map();
        shaderSource.attributes.forEach(attribute => attribLocations.set(attribute, this.gl.getAttribLocation(glShader, attribute)));
        let uniformLocations = new Map();
        shaderSource.uniforms.forEach(uniform => uniformLocations.set(uniform, this.gl.getUniformLocation(glShader, uniform)));
        return new ShaderProgram(glShader, attribLocations, uniformLocations);
    }
    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
}
exports.mapRenderer = mapRenderer;
