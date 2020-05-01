"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const shaders = __importStar(require("./shaders.json"));
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
        this.styleTransitionBoundry = { min: 30, max: 60 };
    }
    setTransitionBoundry(min, max) {
        this.styleTransitionBoundry = { min, max };
    }
    getTransitionScalar(viewMatrix) {
        return Math.min(Math.max((viewMatrix[4] - this.styleTransitionBoundry.min) / (this.styleTransitionBoundry.max - this.styleTransitionBoundry.min), 0), 1);
    }
    renderMap(map, viewMatrix, poly, outline) {
        if (poly)
            this.renderPolygon2dFromBuffer(map.polygons, viewMatrix);
        if (outline)
            this.renderOutline2dFromBuffer(map.outlines, viewMatrix);
    }
    renderLine2d(vertexBuffer, colorBuffer, length, viewMatrix) {
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
    renderLine2dFromBuffer(bufferset, viewMatrix) {
        this.renderLine2d(bufferset.buffers[0].buffer, bufferset.buffers[1].buffer, bufferset.head, viewMatrix);
    }
    renderPolygon2d(vertexBuffer, styleBuffer, length, viewMatrix, drawMode = this.gl.TRIANGLES) {
        this.gl.useProgram(this.polyProgam.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexPosition"));
        this.gl.vertexAttribPointer(this.polyProgam.attribLocations.get("vertexPosition"), 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, styleBuffer);
        this.gl.enableVertexAttribArray(this.polyProgam.attribLocations.get("vertexStyle"));
        this.gl.vertexAttribIPointer(this.polyProgam.attribLocations.get("vertexStyle"), 1, this.gl.INT, 0, 0);
        let styledata1 = new Float32Array([0.2, 0.2, 0.2, 0, 0, 1, 1, 0, 1, 0, 1, 0]);
        let styledata2 = new Float32Array([0.6, 0.6, 0.6, 0, 1, 0, 1, 0, 1, 0, 0, 0]);
        let styleScalar = this.getTransitionScalar(viewMatrix);
        this.gl.uniform1f(this.polyProgam.uniformLocations.get("STYLESCALAR"), styleScalar);
        this.gl.uniform1f(this.polyProgam.uniformLocations.get("ZOOMLEVEL"), viewMatrix[0]);
        this.gl.uniform1f(this.polyProgam.uniformLocations.get("RENDERHEIGHT"), this.gl.canvas.height);
        this.gl.uniform4fv(this.polyProgam.uniformLocations.get("STYLETABLE1"), styledata1);
        this.gl.uniform4fv(this.polyProgam.uniformLocations.get("STYLETABLE2"), styledata2);
        this.gl.uniformMatrix3fv(this.polyProgam.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderPolygon2dFromBuffer(bufferSet, viewMatrix) {
        bufferSet.lock();
        this.renderPolygon2d(bufferSet.buffers[0].buffer, bufferSet.buffers[1].buffer, bufferSet.head, viewMatrix);
        setTimeout(() => bufferSet.unlock(), 40000);
    }
    renderOutline2d(vertexBuffer, normalBuffer, styleBuffer, length, viewMatrix) {
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
        let styledata1 = new Int32Array([1, 0, 0, 3, 0, 1, 0, 3, 0, 0, 1, 20]);
        let styledata2 = new Int32Array([1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0]);
        let styleScalar = this.getTransitionScalar(viewMatrix);
        this.gl.uniform1f(this.outlineProgram.uniformLocations.get("STYLESCALAR"), styleScalar);
        this.gl.uniform1f(this.outlineProgram.uniformLocations.get("ZOOMLEVEL"), viewMatrix[0]);
        this.gl.uniform1f(this.outlineProgram.uniformLocations.get("RENDERHEIGHT"), this.gl.canvas.height);
        this.gl.uniform4fv(this.outlineProgram.uniformLocations.get("STYLETABLE1"), styledata1);
        this.gl.uniform4fv(this.outlineProgram.uniformLocations.get("STYLETABLE2"), styledata2);
        this.gl.uniformMatrix3fv(this.outlineProgram.uniformLocations.get("VIEW"), false, viewMatrix);
        this.gl.drawArrays(drawMode, 0, length);
    }
    renderOutline2dFromBuffer(bufferSet, viewMatrix) {
        bufferSet.lock();
        this.renderOutline2d(bufferSet.buffers[0].buffer, bufferSet.buffers[1].buffer, bufferSet.buffers[2].buffer, bufferSet.head, viewMatrix);
        setTimeout(() => bufferSet.unlock(), 40000);
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
