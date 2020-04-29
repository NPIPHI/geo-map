"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const earcut_1 = __importDefault(require("earcut"));
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
    let adjacent = (x, y, pointStrip) => {
        return Math.abs(x - y) == 1 || Math.abs(pointStrip.length / 2 - y - x) == 1;
    };
    let polygonIndexBuffer = [];
    let length = 0;
    pointStrips.forEach(strip => {
        let polygon = earcut_1.default(strip);
        polygonIndexBuffer.push(polygon);
        length += polygon.length;
    });
    let vertexArray = new Float32Array(length * 2);
    let edgeArray = new Float32Array(length * 3);
    let colorArray = new Float32Array(length * 3);
    let vIndex = 0;
    let eIndex = 0;
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
            for (let i = 0; i < 9; i++) {
                edgeArray[eIndex + i] = 0;
            }
            if (adjacent(v1, v2, strip)) {
                edgeArray[eIndex + 2] = 1;
                edgeArray[eIndex + 5] = 1;
            }
            else {
                edgeArray[eIndex + 8] = 1;
            }
            if (adjacent(v1, v3, strip)) {
                edgeArray[eIndex + 1] = 1;
                edgeArray[eIndex + 7] = 1;
            }
            else {
                edgeArray[eIndex + 4] = 1;
            }
            if (adjacent(v2, v3, strip)) {
                edgeArray[eIndex + 3] = 1;
                edgeArray[eIndex + 6] = 1;
            }
            else {
                edgeArray[eIndex + 0] = 1;
            }
            eIndex += 9;
        }
    }
    let vertexBuffer = buffer(vertexArray);
    let edgeBuffer = buffer(edgeArray);
    let colorBuffer = buffer(colorArray);
    return { vertexBuffer, edgeBuffer, colorBuffer, length };
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
    let colorArray = new Float32Array(length * 3);
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
            let normX = prevX / prevMag + nextX / nextMag;
            let normY = prevY / prevMag + nextY / nextMag;
            let normMag = Math.sqrt(normX * normX + normY * normY);
            normX /= normMag;
            normY /= normMag;
            normalArray[nIndex] = normX;
            normalArray[nIndex + 1] = normY;
            normalArray[nIndex + 2] = -normX;
            normalArray[nIndex + 3] = -normY;
            nIndex += 4;
            colorArray[cIndex] = 1;
            colorArray[cIndex + 1] = 1;
            colorArray[cIndex + 2] = 1;
            colorArray[cIndex + 3] = 1;
            colorArray[cIndex + 4] = 1;
            colorArray[cIndex + 5] = 1;
            cIndex += 6;
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
    let vertexBuffer = buffer(vertexArray);
    let normalBuffer = buffer(normalArray);
    let colorBuffer = buffer(colorArray);
    return { vertexBuffer, normalBuffer, colorBuffer, length };
}
exports.outlineBuffer = outlineBuffer;
function quadBuffer(pointStrips) {
    const lineWidth = 0.05;
    let length = 0;
    pointStrips.forEach(strip => {
        length += strip.length * 2;
    });
    length *= 2;
    let vertexArray = new Float32Array(length * 2);
    let index = 0;
    pointStrips.forEach(strip => {
        index += 2;
        for (let i = 0; i < strip.length - 1; i++) {
            let norm = { x: strip[i].y - strip[i + 1].y, y: -strip[i].x + strip[i + 1].x };
            let normMag = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
            norm.x *= lineWidth / normMag;
            norm.y *= lineWidth / normMag;
            vertexArray[index] = strip[i].x - norm.x;
            vertexArray[index + 1] = strip[i].y - norm.y;
            if (i == 0) {
                vertexArray[index - 2] = vertexArray[index];
                vertexArray[index - 1] = vertexArray[index + 1];
            }
            vertexArray[index + 2] = strip[i].x + norm.x;
            vertexArray[index + 3] = strip[i].y + norm.y;
            index += 4;
        }
        vertexArray[index] = vertexArray[index - 2];
        vertexArray[index + 1] = vertexArray[index - 1];
        index += 2;
    });
    let colorData = new Float32Array(length * 3);
    for (let i = 0; i < colorData.length; i += 3) {
        colorData[i] = 1;
        colorData[i + 1] = 1;
        colorData[i + 2] = 1;
    }
    let vertexBuffer = main_1.gl.createBuffer();
    main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, vertexBuffer);
    main_1.gl.bufferData(main_1.gl.ARRAY_BUFFER, vertexArray, main_1.gl.STATIC_DRAW);
    let colorBuffer = main_1.gl.createBuffer();
    main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, colorBuffer);
    main_1.gl.bufferData(main_1.gl.ARRAY_BUFFER, colorData, main_1.gl.STATIC_DRAW);
    return { vertexBuffer, colorBuffer, length };
}
exports.quadBuffer = quadBuffer;
