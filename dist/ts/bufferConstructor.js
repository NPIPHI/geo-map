"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const earcut_1 = __importDefault(require("earcut"));
const memory_1 = require("./memory");
function buffer(array) {
    let buf = main_1.gl.createBuffer();
    main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, buf);
    main_1.gl.bufferData(main_1.gl.ARRAY_BUFFER, array, main_1.gl.STATIC_DRAW);
    return buf;
}
function lineBuffer(pointStrips) {
    let length = 0;
    pointStrips.forEach(strip => {
        length += strip.length;
    });
    length *= 2;
    let vertexArray = new Float32Array(length * 2);
    let index = 0;
    pointStrips.forEach(strip => {
        for (let i = 0; i < strip.length - 1; i += 2) {
            vertexArray[index] = strip[i];
            vertexArray[index + 1] = strip[i + 1];
            vertexArray[index + 2] = strip[i + 2];
            vertexArray[index + 3] = strip[i + 3];
            index += 4;
        }
        vertexArray[index] = strip[strip.length - 2];
        vertexArray[index + 1] = strip[strip.length - 1];
        vertexArray[index + 2] = strip[0];
        vertexArray[index + 3] = strip[1];
        index += 4;
    });
    let vertexBuffer = buffer(vertexArray);
    let colorArray = new Float32Array(length * 3);
    for (let i = 0; i < colorArray.length; i += 3) {
        colorArray[i] = 1;
        colorArray[i + 1] = 1;
        colorArray[i + 2] = 1;
    }
    let colorBuffer = buffer(colorArray);
    return { vertexBuffer: vertexBuffer, colorBuffer: colorBuffer, length };
}
exports.lineBuffer = lineBuffer;
function polygonBuffer(pointStrips) {
    let polygonIndexBuffer = [];
    let length = 0;
    pointStrips.forEach(strip => {
        let polygon = earcut_1.default(strip);
        polygonIndexBuffer.push(polygon);
        length += polygon.length;
    });
    let vertexArray = new Float32Array(length * 2);
    let colorArray = new Float32Array(length * 3);
    let vIndex = 0;
    let cIndex = 0;
    for (let i = 0; i < polygonIndexBuffer.length; i++) {
        let c = { r: Math.random(), g: 0.5, b: 0.5 };
        for (let j = 0; j < polygonIndexBuffer[i].length; j += 3) {
            let strip = pointStrips[i];
            let v1 = polygonIndexBuffer[i][j];
            let v2 = polygonIndexBuffer[i][j + 1];
            let v3 = polygonIndexBuffer[i][j + 2];
            vertexArray[vIndex + 0] = pointStrips[i][v1 * 2 + 0];
            vertexArray[vIndex + 1] = pointStrips[i][v1 * 2 + 1];
            vertexArray[vIndex + 2] = pointStrips[i][v2 * 2 + 0];
            vertexArray[vIndex + 3] = pointStrips[i][v2 * 2 + 1];
            vertexArray[vIndex + 4] = pointStrips[i][v3 * 2 + 0];
            vertexArray[vIndex + 5] = pointStrips[i][v3 * 2 + 1];
            vIndex += 6;
            for (let i = 0; i < 9; i++) {
                colorArray[cIndex + i] = c.r;
            }
            cIndex += 9;
        }
    }
    let vertexBuffer = buffer(vertexArray);
    let colorBuffer = buffer(colorArray);
    return { vertexBuffer, colorBuffer, length };
}
exports.polygonBuffer = polygonBuffer;
function polyFillLineBuffer(pointStrips) {
    let polygonIndexBuffer = [];
    let length = 0;
    pointStrips.forEach(strip => {
        let polygon = earcut_1.default(strip);
        polygonIndexBuffer.push(polygon);
        length += polygon.length * 2;
    });
    let vertexArray = new Float32Array(length * 2);
    let colorArray = new Float32Array(length * 3);
    let vIndex = 0;
    let cIndex = 0;
    for (let i = 0; i < polygonIndexBuffer.length; i++) {
        let c = { r: Math.random(), g: Math.random(), b: Math.random() };
        for (let j = 0; j < polygonIndexBuffer[i].length; j += 3) {
            let v1 = polygonIndexBuffer[i][j];
            let v2 = polygonIndexBuffer[i][j + 1];
            let v3 = polygonIndexBuffer[i][j + 2];
            vertexArray[vIndex + 0] = pointStrips[i][v1 * 2 + 0];
            vertexArray[vIndex + 1] = pointStrips[i][v1 * 2 + 1];
            vertexArray[vIndex + 2] = pointStrips[i][v2 * 2 + 0];
            vertexArray[vIndex + 3] = pointStrips[i][v2 * 2 + 1];
            vertexArray[vIndex + 4] = pointStrips[i][v2 * 2 + 0];
            vertexArray[vIndex + 5] = pointStrips[i][v2 * 2 + 1];
            vertexArray[vIndex + 6] = pointStrips[i][v3 * 2 + 0];
            vertexArray[vIndex + 7] = pointStrips[i][v3 * 2 + 1];
            vertexArray[vIndex + 8] = pointStrips[i][v3 * 2 + 0];
            vertexArray[vIndex + 9] = pointStrips[i][v3 * 2 + 1];
            vertexArray[vIndex + 10] = pointStrips[i][v1 * 2 + 0];
            vertexArray[vIndex + 11] = pointStrips[i][v1 * 2 + 1];
            vIndex += 12;
            for (let i = 0; i < 18; i += 3) {
                colorArray[cIndex + i] = c.r;
                colorArray[cIndex + i + 1] = c.g;
                colorArray[cIndex + i + 2] = c.b;
            }
            cIndex += 18;
        }
    }
    let vertexBuffer = buffer(vertexArray);
    let colorBuffer = buffer(colorArray);
    return { vertexBuffer, colorBuffer, length };
}
exports.polyFillLineBuffer = polyFillLineBuffer;
function outlineBuffer(pointStrips) {
    let length = pointStrips.reduce((length, strip) => length + strip.length + 4, 0);
    let vertexArray = new Float32Array(length * 2);
    let normalArray = new Float32Array(length * 2);
    let styleArray = new Int32Array(length);
    let vIndex = 0;
    let nIndex = 0;
    let cIndex = 0;
    pointStrips.forEach(strip => {
        let startVIndex = vIndex;
        let startNIndex = nIndex;
        let startCIndex = cIndex;
        vIndex += 2;
        nIndex += 2;
        cIndex += 3;
        for (let i = 0; i < strip.length + 1; i += 2) {
            let prevX = strip[(i - 2 + strip.length) % strip.length];
            let prevY = strip[(i - 1 + strip.length) % strip.length];
            let curX = strip[i % strip.length];
            let curY = strip[(i + 1) % strip.length];
            let nextX = strip[(i + 2) % strip.length];
            let nextY = strip[(i + 3) % strip.length];
            vertexArray[vIndex] = curX;
            vertexArray[vIndex + 1] = curY;
            vertexArray[vIndex + 2] = curX;
            vertexArray[vIndex + 3] = curY;
            vIndex += 4;
            prevX = curX - prevX;
            prevY = curY - prevY;
            nextX = curX - nextX;
            nextY = curY - nextY;
            let prevMag = Math.sqrt(prevX * prevX + prevY * prevY);
            let nextMag = Math.sqrt(nextX * nextX + nextY * nextY);
            prevX /= prevMag;
            prevY /= prevMag;
            nextX /= nextMag;
            nextY /= nextMag;
            let normX = prevX + nextX;
            let normY = prevY + nextY;
            let normMag = Math.sqrt(normX * normX + normY * normY);
            if (normMag < 0.001) {
                normX = -prevY;
                normY = prevX;
            }
            else {
                normX /= normMag;
                normY /= normMag;
                let normDot = Math.abs(normX * -prevY + normY * prevX);
                normDot = Math.max(normDot, 0.5);
                normX /= normDot;
                normY /= normDot;
            }
            if (normX * -prevY + normY * prevX < 0) {
                normX *= -1;
                normY *= -1;
            }
            normalArray[nIndex] = normX;
            normalArray[nIndex + 1] = normY;
            normalArray[nIndex + 2] = -normX;
            normalArray[nIndex + 3] = -normY;
            nIndex += 4;
            cIndex += 2;
        }
        vertexArray[startVIndex] = vertexArray[startVIndex + 2];
        vertexArray[startVIndex + 1] = vertexArray[startVIndex + 3];
        normalArray[startNIndex] = normalArray[startNIndex + 2];
        normalArray[startNIndex + 1] = normalArray[startNIndex + 3];
        vertexArray[vIndex] = vertexArray[vIndex - 2];
        vertexArray[vIndex + 1] = vertexArray[vIndex - 1];
        vIndex += 2;
        normalArray[nIndex] = normalArray[nIndex - 2];
        normalArray[nIndex + 1] = normalArray[nIndex - 1];
        nIndex += 2;
        cIndex += 3;
    });
    for (let i = 0; i < styleArray.length / 2; i++) {
        styleArray[i] = 1;
    }
    let vertexBuffer = buffer(vertexArray);
    let normalBuffer = buffer(normalArray);
    let styleBuffer = buffer(styleArray);
    return { vertexBuffer, normalBuffer, styleBuffer, length };
}
exports.outlineBuffer = outlineBuffer;
function bufferSetTest(pointStrips) {
    let polygonIndexBuffer = pointStrips.map(strip => earcut_1.default(strip));
    let memoryLocations = [];
    for (let i = 0; i < polygonIndexBuffer.length; i++) {
        let c = { r: Math.random(), g: 0.5, b: 0.5 };
        let length = polygonIndexBuffer[i].length;
        let vArray = new Float32Array(length * 2);
        let cArray = new Float32Array(length * 3);
        let vIndex = 0;
        let cIndex = 0;
        for (let j = 0; j < polygonIndexBuffer[i].length; j += 3) {
            let v1 = polygonIndexBuffer[i][j];
            let v2 = polygonIndexBuffer[i][j + 1];
            let v3 = polygonIndexBuffer[i][j + 2];
            vArray[vIndex + 0] = pointStrips[i][v1 * 2 + 0];
            vArray[vIndex + 1] = pointStrips[i][v1 * 2 + 1];
            vArray[vIndex + 2] = pointStrips[i][v2 * 2 + 0];
            vArray[vIndex + 3] = pointStrips[i][v2 * 2 + 1];
            vArray[vIndex + 4] = pointStrips[i][v3 * 2 + 0];
            vArray[vIndex + 5] = pointStrips[i][v3 * 2 + 1];
            vIndex += 6;
            for (let i = 0; i < 9; i++) {
                cArray[cIndex + i] = c.r;
            }
            cIndex += 9;
        }
        memoryLocations.push(new memory_1.GPUMemory(length, [vArray, cArray]));
    }
    return memoryLocations;
}
exports.bufferSetTest = bufferSetTest;
