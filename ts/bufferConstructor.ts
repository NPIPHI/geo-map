import { gl } from "./main"
import earcut from "earcut"
import { GPUBufferSet, GPUMemoryObject } from "./memory"

function buffer(array: ArrayBuffer) {
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    return buf;
}

export class bufferConstructor {
    static lineBuffer(pointStrips: Float32Array[]): {buffer: GPUBufferSet, features: {offsets: Int32Array, widths: Int32Array}}  {
        let length = 0;
        pointStrips.forEach(strip => {
            length += strip.length*2;
        })
        let GPUMemoryOffsets = new Int32Array(length);
        let GPUMemoryWidths = new Int32Array(length);
        let featureIndex = 0;
        let vertexArray = new Float32Array(length * 2);
        let attribIndex = 0;
        pointStrips.forEach(strip => {
            GPUMemoryOffsets[featureIndex] = attribIndex;
            GPUMemoryWidths[featureIndex] = 2 * strip.length;
            for (let i = 0; i < strip.length - 1; i += 2) {
                vertexArray[attribIndex] = strip[i];
                vertexArray[attribIndex + 1] = strip[i + 1];
                vertexArray[attribIndex + 2] = strip[i + 2];
                vertexArray[attribIndex + 3] = strip[i + 3];
                attribIndex += 4;
            }
            vertexArray[attribIndex] = strip[strip.length - 2];
            vertexArray[attribIndex + 1] = strip[strip.length - 1];
            vertexArray[attribIndex + 2] = strip[0];
            vertexArray[attribIndex + 3] = strip[1];
            attribIndex += 4;
            featureIndex++;
        })
        let vertexBuffer = buffer(vertexArray);

        let colorArray = new Float32Array(length * 3);
        for (let i = 0; i < colorArray.length; i += 3) {
            colorArray[i] = 1;
            colorArray[i + 1] = 1;
            colorArray[i + 2] = 1;

        }

        let colorBuffer = buffer(colorArray);

        return {buffer: GPUBufferSet.createFromBuffers([2*4, 3*4], [vertexBuffer, colorBuffer], length), features: {offsets: GPUMemoryOffsets, widths: GPUMemoryWidths} }
    }

    static polygonBuffer(pointStrips: Float32Array[]): {buffer: GPUBufferSet, features: {offsets: Int32Array, widths: Int32Array}} {
        let polygonIndexBuffer: number[][] = [];
        let length = 0;
        pointStrips.forEach(strip => {
            let polygon = earcut(strip);
            polygonIndexBuffer.push(polygon);
            length += polygon.length;
        })

        let GPUMemoryOffsets = new Int32Array(length);
        let GPUMemoryWidths = new Int32Array(length);
        let vertexArray = new Float32Array(length * 2);
        let styleArray = new Int32Array(length);

        let featureIndex = 0;
        let attribIndex = 0;
        for (let i = 0; i < polygonIndexBuffer.length; i++) {
            GPUMemoryOffsets[featureIndex] = attribIndex;
            GPUMemoryWidths[featureIndex] = polygonIndexBuffer[i].length;
            for (let j = 0; j < polygonIndexBuffer[i].length; j += 3) {
                let strip = pointStrips[i];
                let v1 = polygonIndexBuffer[i][j];
                let v2 = polygonIndexBuffer[i][j + 1];
                let v3 = polygonIndexBuffer[i][j + 2];
                vertexArray[attribIndex * 2 + 0] = pointStrips[i][v1 * 2 + 0]
                vertexArray[attribIndex * 2 + 1] = pointStrips[i][v1 * 2 + 1]
                vertexArray[attribIndex * 2 + 2] = pointStrips[i][v2 * 2 + 0]
                vertexArray[attribIndex * 2 + 3] = pointStrips[i][v2 * 2 + 1]
                vertexArray[attribIndex * 2 + 4] = pointStrips[i][v3 * 2 + 0]
                vertexArray[attribIndex * 2 + 5] = pointStrips[i][v3 * 2 + 1]

                for (let i = 0; i < 9; i++) {
                    styleArray[attribIndex + i] = 0;
                }
                attribIndex += 3;
            }
            featureIndex++;
        }

        let vertexBuffer = buffer(vertexArray);
        let colorBuffer = buffer(styleArray);

        return {buffer: GPUBufferSet.createFromBuffers([2*4, 1*4], [vertexBuffer, colorBuffer], length), features: {offsets: GPUMemoryOffsets, widths: GPUMemoryWidths}}
    }

    static outlineBuffer(pointStrips: Float32Array[]): {buffer: GPUBufferSet, features: {offsets: Int32Array, widths: Int32Array}} {
        let length = pointStrips.reduce((length, strip) => length + strip.length + 4, 0);
        let GPUMemoryOffsets = new Int32Array(length);
        let GPUMemoryWidths = new Int32Array(length);
        let vertexArray = new Float32Array(length * 2);
        let normalArray = new Float32Array(length * 2);
        let styleArray = new Int32Array(length);

        let featureIndex = 0;
        let attribIndex = 0;
        pointStrips.forEach(strip => {
            GPUMemoryOffsets[featureIndex] = attribIndex;
            GPUMemoryWidths[featureIndex] = strip.length + 4;
            let startAttribIndex = attribIndex;
            attribIndex += 1;

            //reserve space for the degenrate point
            for (let i = 0; i < strip.length + 1; i += 2) {
                let prevX = strip[(i - 2 + strip.length) % strip.length];
                let prevY = strip[(i - 1 + strip.length) % strip.length];
                let curX = strip[i % strip.length];
                let curY = strip[(i + 1) % strip.length];
                let nextX = strip[(i + 2) % strip.length];
                let nextY = strip[(i + 3) % strip.length];

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
                } else {
                    normX /= normMag;
                    normY /= normMag;
                    let normDot = Math.abs(normX * -prevY + normY * prevX)
                    normDot = Math.max(normDot, 0.5);//dont allow sharp points to produce large normals
                    normX /= normDot;
                    normY /= normDot;
                }

                if (normX * -prevY + normY * prevX < 0) {
                    normX *= -1;
                    normY *= -1;
                    //makes sure all normals point outward
                }
                normalArray[attribIndex * 2] = normX;
                normalArray[attribIndex * 2 + 1] = normY;
                normalArray[attribIndex * 2 + 2] = -normX;
                normalArray[attribIndex * 2 + 3] = -normY;

                attribIndex += 2;
            }
            //insert leading degerate point
            vertexArray[startAttribIndex * 2] = vertexArray[startAttribIndex * 2 + 2];
            vertexArray[startAttribIndex * 2 + 1] = vertexArray[startAttribIndex * 2 + 3];

            normalArray[startAttribIndex * 2] = normalArray[startAttribIndex * 2 + 2];
            normalArray[startAttribIndex * 2 + 1] = normalArray[startAttribIndex * 2 + 3];

            //insert trailing degerate point
            vertexArray[attribIndex * 2] = vertexArray[attribIndex * 2 - 2];
            vertexArray[attribIndex * 2 + 1] = vertexArray[attribIndex * 2 - 1];

            normalArray[attribIndex * 2] = normalArray[attribIndex * 2 - 2];
            normalArray[attribIndex * 2 + 1] = normalArray[attribIndex * 2 - 1];

            attribIndex += 1;
            featureIndex++;
        });

        for (let i = 0; i < styleArray.length / 2; i++) {
            styleArray[i] = 1;
        }
        let vertexBuffer = buffer(vertexArray);
        let normalBuffer = buffer(normalArray);
        let styleBuffer = buffer(styleArray);
        return {buffer: GPUBufferSet.createFromBuffers([2*4, 2*4, 1*4], [vertexBuffer, normalBuffer, styleBuffer], length), features: {offsets: GPUMemoryOffsets, widths: GPUMemoryWidths}};
    }
}

export class featureConstructor {
    static lineBuffer(strip: Float32Array): GPUMemoryObject {
        let length = strip.length * 2; //2 points per line
        let vertexArray = new Float32Array(length * 2);
        let colorArray = new Float32Array(length * 3);
        let index = 0;
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

        for (let i = 0; i < colorArray.length; i += 3) {
            colorArray[i] = 1;
            colorArray[i + 1] = 1;
            colorArray[i + 2] = 1;

        }

        return new GPUMemoryObject(length, [vertexArray, colorArray]);
    }

    static polygonBuffer(strip: Float32Array): GPUMemoryObject {
        let polygonIndexBuffer: number[] = earcut(strip);
        let length = earcut.length;
        let vertexArray = new Float32Array(length * 2);
        let styleArray = new Float32Array(length);

        let vIndex = 0;
        let cIndex = 0;
        let c = { r: Math.random(), g: 0.5, b: 0.5 }
        for (let j = 0; j < polygonIndexBuffer.length; j += 3) {
            let v1 = polygonIndexBuffer[j];
            let v2 = polygonIndexBuffer[j + 1];
            let v3 = polygonIndexBuffer[j + 2];
            vertexArray[vIndex + 0] = strip[v1 * 2 + 0]
            vertexArray[vIndex + 1] = strip[v1 * 2 + 1]
            vertexArray[vIndex + 2] = strip[v2 * 2 + 0]
            vertexArray[vIndex + 3] = strip[v2 * 2 + 1]
            vertexArray[vIndex + 4] = strip[v3 * 2 + 0]
            vertexArray[vIndex + 5] = strip[v3 * 2 + 1]
            vIndex += 6;

            for (let i = 0; i < 3; i++) {
                styleArray[cIndex + i] = 0;
            }
            cIndex += 3;
        }

        return new GPUMemoryObject(length, [vertexArray, styleArray]);
    }

    static outlineBuffer(strip: Float32Array): GPUMemoryObject {
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

        //reserve space for the degenrate point
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
            } else {
                normX /= normMag;
                normY /= normMag;
                let normDot = Math.abs(normX * -prevY + normY * prevX)
                normDot = Math.max(normDot, 0.5);//dont allow sharp points to produce large normals
                normX /= normDot;
                normY /= normDot;
            }

            if (normX * -prevY + normY * prevX < 0) {
                normX *= -1;
                normY *= -1;
                //makes sure all normals point outward
            }
            normalArray[nIndex] = normX;
            normalArray[nIndex + 1] = normY;
            //normalArray[nIndex + 2] = -0;
            //normalArray[nIndex + 3] = -0;
            normalArray[nIndex + 2] = -normX;
            normalArray[nIndex + 3] = -normY;
            nIndex += 4;

            cIndex += 2;
        }
        //insert leading degerate point
        vertexArray[0] = vertexArray[2];
        vertexArray[1] = vertexArray[3];

        normalArray[0] = normalArray[2];
        normalArray[1] = normalArray[3];

        //insert trailing degerate point
        vertexArray[vIndex] = vertexArray[vIndex - 2];
        vertexArray[vIndex + 1] = vertexArray[vIndex - 1];

        normalArray[nIndex] = normalArray[nIndex - 2];
        normalArray[nIndex + 1] = normalArray[nIndex - 1];

        return new GPUMemoryObject(length, [vertexArray, normalArray, styleArray]);
    }
}