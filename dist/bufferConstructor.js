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
class bufferConstructor {
    constructor(bBox) {
        this.xAdd = -bBox.x1;
        this.xScale = 1 / (bBox.x2 - bBox.x1);
        this.yAdd = -bBox.y1;
        this.yScale = 1 / (bBox.y2 - bBox.y1);
        if (Math.abs(Math.log(this.xScale / this.yScale)) > 0.01) {
            console.warn("Non square bounds detected, rendering will be stretched");
        }
    }
    lineBuffer(pointStrips) {
        let length = 0;
        pointStrips.forEach(strip => {
            length += strip.length * 2;
        });
        let GPUMemoryOffsets = new Int32Array(length);
        let GPUMemoryWidths = new Int32Array(length);
        let featureIndex = 0;
        let vertexArray = new Float32Array(length * 2);
        let attribIndex = 0;
        pointStrips.forEach(strip => {
            GPUMemoryOffsets[featureIndex] = attribIndex;
            GPUMemoryWidths[featureIndex] = 2 * strip.length;
            for (let i = 0; i < strip.length - 1; i += 2) {
                vertexArray[attribIndex] = (strip[i] + this.xAdd) * this.xScale;
                vertexArray[attribIndex + 1] = (strip[i + 1] + this.yAdd) * this.yScale;
                vertexArray[attribIndex + 2] = (strip[i + 2] + this.xAdd) * this.xScale;
                vertexArray[attribIndex + 3] = (strip[i + 3] + this.yAdd) * this.yScale;
                attribIndex += 4;
            }
            vertexArray[attribIndex] = strip[strip.length - 2];
            vertexArray[attribIndex + 1] = strip[strip.length - 1];
            vertexArray[attribIndex + 2] = strip[0];
            vertexArray[attribIndex + 3] = strip[1];
            attribIndex += 4;
            featureIndex++;
        });
        let vertexBuffer = buffer(vertexArray);
        let colorArray = new Float32Array(length * 3);
        for (let i = 0; i < colorArray.length; i += 3) {
            colorArray[i] = 1;
            colorArray[i + 1] = 1;
            colorArray[i + 2] = 1;
        }
        let colorBuffer = buffer(colorArray);
        return { buffer: memory_1.GPUBufferSet.createFromBuffers([2 * 4, 3 * 4], [vertexBuffer, colorBuffer], length), features: { offsets: GPUMemoryOffsets, widths: GPUMemoryWidths } };
    }
    inPlaceOutlineBuffer(pointStrips, target) {
        let length = pointStrips.reduce((length, strip) => length + strip.length + 4, 0);
        let GPUMemoryOffsets = new Int32Array(pointStrips.length);
        let GPUMemoryWidths = new Int32Array(pointStrips.length);
        let vertexArray = new Float32Array(length * 2);
        let normalArray = new Float32Array(length * 2);
        let styleArray = new Int32Array(length);
        let memoryOffset = target.head;
        let featureIndex = 0;
        let attribIndex = 0;
        pointStrips.forEach(strip => {
            GPUMemoryOffsets[featureIndex] = attribIndex + memoryOffset;
            GPUMemoryWidths[featureIndex] = strip.length + 4;
            let startAttribIndex = attribIndex;
            attribIndex += 1;
            for (let i = 0; i < strip.length + 1; i += 2) {
                let prevX = (strip[(i - 2 + strip.length) % strip.length] + this.xAdd) * this.xScale;
                let prevY = (strip[(i - 1 + strip.length) % strip.length] + this.yAdd) * this.yScale;
                let curX = (strip[i % strip.length] + this.xAdd) * this.xScale;
                let curY = (strip[(i + 1) % strip.length] + this.yAdd) * this.yScale;
                let nextX = (strip[(i + 2) % strip.length] + this.xAdd) * this.xScale;
                let nextY = (strip[(i + 3) % strip.length] + this.yAdd) * this.yScale;
                vertexArray[attribIndex * 2] = curX;
                vertexArray[attribIndex * 2 + 1] = curY;
                vertexArray[attribIndex * 2 + 2] = curX;
                vertexArray[attribIndex * 2 + 3] = curY;
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
                normalArray[attribIndex * 2] = normX;
                normalArray[attribIndex * 2 + 1] = normY;
                normalArray[attribIndex * 2 + 2] = -normX;
                normalArray[attribIndex * 2 + 3] = -normY;
                attribIndex += 2;
            }
            vertexArray[startAttribIndex * 2] = vertexArray[startAttribIndex * 2 + 2];
            vertexArray[startAttribIndex * 2 + 1] = vertexArray[startAttribIndex * 2 + 3];
            normalArray[startAttribIndex * 2] = normalArray[startAttribIndex * 2 + 2];
            normalArray[startAttribIndex * 2 + 1] = normalArray[startAttribIndex * 2 + 3];
            vertexArray[attribIndex * 2] = vertexArray[attribIndex * 2 - 2];
            vertexArray[attribIndex * 2 + 1] = vertexArray[attribIndex * 2 - 1];
            normalArray[attribIndex * 2] = normalArray[attribIndex * 2 - 2];
            normalArray[attribIndex * 2 + 1] = normalArray[attribIndex * 2 - 1];
            attribIndex += 1;
            featureIndex++;
        });
        target.addRaw([vertexArray, normalArray, styleArray]);
        return { offsets: GPUMemoryOffsets, widths: GPUMemoryWidths };
    }
    inPlacePolygonBuffer(pointStrips, target) {
        let polygonIndexBuffer = [];
        let length = 0;
        pointStrips.forEach(strip => {
            let polygon = earcut_1.default(strip);
            polygonIndexBuffer.push(polygon);
            length += polygon.length;
        });
        let GPUMemoryOffsets = new Int32Array(pointStrips.length);
        let GPUMemoryWidths = new Int32Array(pointStrips.length);
        let vertexArray = new Float32Array(length * 2);
        let styleArray = new Int32Array(length);
        let memoryOffset = target.head;
        let featureIndex = 0;
        let attribIndex = 0;
        for (let i = 0; i < polygonIndexBuffer.length; i++) {
            GPUMemoryOffsets[featureIndex] = attribIndex + memoryOffset;
            GPUMemoryWidths[featureIndex] = polygonIndexBuffer[i].length;
            let garishColor = 0;
            if (Math.random() < 0.05) {
                garishColor = 1;
            }
            if (Math.random() < 0.05) {
                garishColor = 3;
            }
            for (let j = 0; j < polygonIndexBuffer[i].length; j += 3) {
                let v1 = polygonIndexBuffer[i][j];
                let v2 = polygonIndexBuffer[i][j + 1];
                let v3 = polygonIndexBuffer[i][j + 2];
                vertexArray[attribIndex * 2 + 0] = (pointStrips[i][v1 * 2 + 0] + this.xAdd) * this.xScale;
                vertexArray[attribIndex * 2 + 1] = (pointStrips[i][v1 * 2 + 1] + this.yAdd) * this.yScale;
                vertexArray[attribIndex * 2 + 2] = (pointStrips[i][v2 * 2 + 0] + this.xAdd) * this.xScale;
                vertexArray[attribIndex * 2 + 3] = (pointStrips[i][v2 * 2 + 1] + this.yAdd) * this.yScale;
                vertexArray[attribIndex * 2 + 4] = (pointStrips[i][v3 * 2 + 0] + this.xAdd) * this.xScale;
                vertexArray[attribIndex * 2 + 5] = (pointStrips[i][v3 * 2 + 1] + this.yAdd) * this.yScale;
                styleArray[attribIndex] = garishColor;
                styleArray[attribIndex + 1] = garishColor;
                styleArray[attribIndex + 2] = garishColor;
                attribIndex += 3;
            }
            featureIndex++;
        }
        target.addRaw([vertexArray, styleArray]);
        return { offsets: GPUMemoryOffsets, widths: GPUMemoryWidths };
    }
    featureLineBuffer(strip) {
        let length = strip.length * 2;
        let vertexArray = new Float32Array(length * 2);
        let colorArray = new Float32Array(length * 3);
        let index = 0;
        for (let i = 0; i < strip.length - 1; i += 2) {
            vertexArray[index] = (strip[i] + this.xAdd) * this.xScale;
            vertexArray[index + 1] = (strip[i + 1] + this.yAdd) * this.yScale;
            vertexArray[index + 2] = (strip[i + 2] + this.xAdd) * this.xScale;
            vertexArray[index + 3] = (strip[i + 3] + this.yAdd) * this.yScale;
            index += 4;
        }
        vertexArray[index] = strip[strip.length - 2];
        vertexArray[index + 1] = strip[strip.length - 1];
        vertexArray[index + 2] = strip[0];
        vertexArray[index + 3] = strip[1];
        index += 4;
        for (let i = 0; i < colorArray.length; i += 3) {
            colorArray[i] = 1;
            colorArray[i + 1] = 1;
            colorArray[i + 2] = 1;
        }
        return new memory_1.GPUMemoryObject(length, [vertexArray, colorArray]);
    }
    featurePolygonBuffer(strip) {
        let polygonIndexBuffer = earcut_1.default(strip);
        let length = polygonIndexBuffer.length;
        let vertexArray = new Float32Array(length * 2);
        let styleArray = new Float32Array(length);
        let vIndex = 0;
        let cIndex = 0;
        for (let i = 0; i < polygonIndexBuffer.length; i += 3) {
            let v1 = polygonIndexBuffer[i];
            let v2 = polygonIndexBuffer[i + 1];
            let v3 = polygonIndexBuffer[i + 2];
            vertexArray[vIndex + 0] = (strip[v1 * 2 + 0] + this.xAdd) * this.xScale;
            vertexArray[vIndex + 1] = (strip[v1 * 2 + 1] + this.yAdd) * this.yScale;
            vertexArray[vIndex + 2] = (strip[v2 * 2 + 0] + this.xAdd) * this.xScale;
            vertexArray[vIndex + 3] = (strip[v2 * 2 + 1] + this.yAdd) * this.yScale;
            vertexArray[vIndex + 4] = (strip[v3 * 2 + 0] + this.xAdd) * this.xScale;
            vertexArray[vIndex + 5] = (strip[v3 * 2 + 1] + this.yAdd) * this.yScale;
            vIndex += 6;
            for (let i = 0; i < 3; i++) {
                styleArray[cIndex + i] = 0;
            }
            cIndex += 3;
        }
        return new memory_1.GPUMemoryObject(length, [vertexArray, styleArray]);
    }
    featureOutlineBuffer(strip) {
        let length = strip.length + 4;
        let vertexArray = new Float32Array(length * 2);
        let normalArray = new Float32Array(length * 2);
        let styleArray = new Int32Array(length);
        let vIndex = 0;
        let nIndex = 0;
        let cIndex = 0;
        vIndex += 2;
        nIndex += 2;
        cIndex += 3;
        for (let i = 0; i < strip.length + 1; i += 2) {
            let prevX = (strip[(i - 2 + strip.length) % strip.length] + this.xAdd) * this.xScale;
            let prevY = (strip[(i - 1 + strip.length) % strip.length] + this.yAdd) * this.yScale;
            let curX = (strip[i % strip.length] + this.xAdd) * this.xScale;
            let curY = (strip[(i + 1) % strip.length] + this.yAdd) * this.yScale;
            let nextX = (strip[(i + 2) % strip.length] + this.xAdd) * this.xScale;
            let nextY = (strip[(i + 3) % strip.length] + this.yAdd) * this.yScale;
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
        vertexArray[0] = vertexArray[2];
        vertexArray[1] = vertexArray[3];
        normalArray[0] = normalArray[2];
        normalArray[1] = normalArray[3];
        vertexArray[vIndex] = vertexArray[vIndex - 2];
        vertexArray[vIndex + 1] = vertexArray[vIndex - 1];
        normalArray[nIndex] = normalArray[nIndex - 2];
        normalArray[nIndex + 1] = normalArray[nIndex - 1];
        return new memory_1.GPUMemoryObject(length, [vertexArray, normalArray, styleArray]);
    }
}
exports.bufferConstructor = bufferConstructor;
