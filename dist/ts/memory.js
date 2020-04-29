"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const growthRatio = 1.1;
const preallocatedSize = 100;
class GPUBufferSet {
    constructor(elementWidths, buffers, size) {
        elementWidths.forEach(ele => {
            if (ele % 4) {
                console.warn("The Index Width supplied was not a multipul of 4, element widths are in bytes");
            }
        });
        this.buffers = [];
        for (let i = 0; i < elementWidths.length; i++) {
            this.buffers.push({ byteSize: elementWidths[i], buffer: buffers[i] });
        }
        this.bufferSize = size;
        this.holes = new Map();
        this.head = 0;
    }
    static create(elementWidths) {
        let buffers = elementWidths.map(byteSize => {
            let buffer = main_1.gl.createBuffer();
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, buffer);
            main_1.gl.bufferData(main_1.gl.ARRAY_BUFFER, preallocatedSize * byteSize, main_1.gl.STATIC_DRAW);
            return buffer;
        });
        return new GPUBufferSet(elementWidths, buffers, preallocatedSize);
    }
    static createFromSize(elementWidths, size) {
        let buffers = elementWidths.map(byteSize => {
            let buffer = main_1.gl.createBuffer();
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, buffer);
            main_1.gl.bufferData(main_1.gl.ARRAY_BUFFER, size * byteSize, main_1.gl.STATIC_DRAW);
            return buffer;
        });
        return new GPUBufferSet(elementWidths, buffers, size);
    }
    static createFromBuffers(elementWidths, buffers, size) {
        return new GPUBufferSet(elementWidths, buffers, size);
    }
    remove(location) {
        this.clearMemory(location);
        if (this.head == location.GPUWidth + location.GPUOffset) {
            this.head -= location.GPUWidth;
        }
        else {
            let holeArray = this.holes.get(location.GPUWidth);
            if (holeArray) {
                holeArray.push(location.GPUWidth);
            }
            else {
                this.holes.set(location.GPUWidth, [location.GPUWidth]);
            }
        }
        location.GPUOffset = -1;
    }
    removeArray(locations) {
        locations.forEach(location => this.remove(location));
    }
    add(location) {
        if (location.GPUOffset != -1) {
            throw ("location alredy added");
        }
        let swapLocation = this.holes.get(location.GPUWidth);
        if (swapLocation && swapLocation.length) {
            this.fillHole(swapLocation.pop(), location);
        }
        else {
            location.GPUOffset = this.head;
            this.head += location.GPUWidth;
            this.putMemory(location);
        }
    }
    addArray(locations) {
        let unifiedWidth = locations.reduce((accumulator, location) => accumulator + location.GPUWidth, 0);
        let insertHead;
        let swapLocation = this.holes.get(unifiedWidth);
        if (swapLocation && swapLocation.length) {
            insertHead = swapLocation.pop();
        }
        else {
            insertHead = this.head;
            this.head += unifiedWidth;
        }
        let localHead = 0;
        locations.forEach(location => {
            location.GPUOffset = localHead + insertHead;
            localHead += location.GPUWidth;
        });
        let unifiedArrays = [];
        for (let i = 0; i < locations[0].GPUData.length; i++) {
            let attribArray;
            if (locations[0].GPUData[i] instanceof Float32Array) {
                attribArray = new Float32Array(unifiedWidth * this.buffers[i].byteSize / 4);
            }
            if (locations[0].GPUData[i] instanceof Int32Array) {
                attribArray = new Int32Array(unifiedWidth * this.buffers[i].byteSize / 4);
            }
            let offset = 0;
            locations.forEach(location => {
                attribArray.set(location.GPUData[i], offset);
                offset += location.GPUData[i].length;
            });
            unifiedArrays.push(attribArray);
        }
        this.putMemoryChunck(insertHead, unifiedWidth, unifiedArrays);
    }
    reallocateBuffers(minSize) {
        this.resizeBuffers(Math.max(Math.floor(this.bufferSize * growthRatio), minSize));
    }
    resizeBuffers(size) {
        this.buffers.forEach(buffer => {
            let newBuffer = main_1.gl.createBuffer();
            main_1.gl.bindBuffer(main_1.gl.COPY_WRITE_BUFFER, newBuffer);
            main_1.gl.bufferData(main_1.gl.COPY_WRITE_BUFFER, size * buffer.byteSize, main_1.gl.STATIC_COPY);
            main_1.gl.bindBuffer(main_1.gl.COPY_READ_BUFFER, buffer.buffer);
            main_1.gl.copyBufferSubData(main_1.gl.COPY_READ_BUFFER, main_1.gl.COPY_WRITE_BUFFER, 0, 0, this.bufferSize * buffer.byteSize);
            main_1.gl.deleteBuffer(buffer.buffer);
            buffer.buffer = newBuffer;
        });
        this.bufferSize = size;
    }
    clearMemory(location) {
        this.buffers.forEach(buffer => {
            let clearMemory = new Float32Array(location.GPUWidth * buffer.byteSize / 4);
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, buffer.buffer);
            main_1.gl.bufferSubData(main_1.gl.ARRAY_BUFFER, buffer.byteSize * location.GPUOffset, clearMemory);
        });
    }
    putMemory(memory) {
        this.putMemoryChunck(memory.GPUOffset, memory.GPUWidth, memory.GPUData);
    }
    putMemoryChunck(offset, width, data) {
        while (offset + width > this.bufferSize) {
            this.reallocateBuffers(offset + width - this.bufferSize);
        }
        for (let i = 0; i < this.buffers.length; i++) {
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, this.buffers[i].buffer);
            main_1.gl.bufferSubData(main_1.gl.ARRAY_BUFFER, this.buffers[i].byteSize * offset, data[i]);
        }
    }
    fillHole(hole, replace) {
        replace.GPUOffset = hole;
        this.putMemory(replace);
    }
    swap(m1, m2) {
        if (m1.GPUWidth != m2.GPUWidth) {
            throw ("incompatable widths");
        }
        let otherOffset = m2.GPUOffset;
        m2.GPUOffset = m1.GPUOffset;
        m1.GPUOffset = otherOffset;
        this.putMemory(m1);
        this.putMemory(m2);
    }
}
exports.GPUBufferSet = GPUBufferSet;
class GPUMemoryTest {
    constructor(width, data) {
        this.GPUWidth = width;
        this.GPUData = data;
    }
}
exports.GPUMemoryTest = GPUMemoryTest;
