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
        this.holes = [];
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
        if (this.head == location.width + location.offset) {
            this.head -= location.width;
        }
        else {
            this.holes.push(location.copyLocation());
        }
    }
    add(location) {
        if (location.offset == -1) {
            throw ("location alredy added");
        }
        let swapLocation = this.holes.find((ele) => ele.width == location.width);
        if (swapLocation) {
            this.replace(swapLocation, location);
            this.holes.splice(this.holes.indexOf(swapLocation), 1);
        }
        else {
            if (this.bufferSize - this.head > location.width) {
                location.offset = this.head;
                this.head += location.width;
                this.putMemory(location);
            }
            else {
                throw ("ran out of buffer");
            }
        }
    }
    addArray(locations) {
        let unifiedWidth = locations.reduce((accumulator, location) => accumulator + location.width, 0);
        let swapLocation = this.holes.find((ele) => ele.width == unifiedWidth);
        let insertLocation;
        if (swapLocation) {
            insertLocation = swapLocation.offset;
            this.holes.splice(this.holes.indexOf(swapLocation), 1);
        }
        else if (this.bufferSize - this.head > unifiedWidth) {
            insertLocation = this.head;
            this.head += unifiedWidth;
        }
        else {
            throw ("ran out of buffer");
        }
        let unifiedArrays = [];
        for (let i = 0; i < locations[0].data.length; i++) {
            let attribArray;
            if (locations[0].data[i] instanceof Float32Array) {
                attribArray = new Float32Array(unifiedWidth * this.buffers[i].byteSize / 4);
            }
            if (locations[0].data[i] instanceof Int32Array) {
                attribArray = new Int32Array(unifiedWidth * this.buffers[i].byteSize / 4);
            }
            let offset = 0;
            locations.forEach(location => {
                attribArray.set(location.data[i], offset);
                offset += location.data[i].length;
            });
        }
        this.putMemoryChunck(this.head, unifiedArrays);
    }
    clearMemory(location) {
        this.buffers.forEach(buffer => {
            let clearMemory = new Float32Array(location.width * buffer.byteSize / 4);
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, buffer.buffer);
            main_1.gl.bufferSubData(main_1.gl.ARRAY_BUFFER, buffer.byteSize * location.offset, clearMemory);
        });
    }
    putMemory(memory) {
        this.putMemoryChunck(memory.offset, memory.data);
    }
    putMemoryChunck(offset, data) {
        for (let i = 0; i < this.buffers.length; i++) {
            main_1.gl.bindBuffer(main_1.gl.ARRAY_BUFFER, this.buffers[i].buffer);
            main_1.gl.bufferSubData(main_1.gl.ARRAY_BUFFER, this.buffers[i].byteSize * offset, data[i]);
        }
    }
    replace(old, replace) {
        if (old.width != replace.width) {
            throw ("incompatable widths");
        }
        replace.offset = old.offset;
        old.offset = -1;
        this.putMemory(replace);
    }
    swap(m1, m2) {
        if (m1.width != m2.width) {
            throw ("incompatable widths");
        }
        let otherOffset = m2.offset;
        m2.offset = m1.offset;
        m1.offset = otherOffset;
        this.putMemory(m1);
        this.putMemory(m2);
    }
}
exports.GPUBufferSet = GPUBufferSet;
class GPUMemory {
    constructor(width, data) {
        this.offset = -1;
        this.width = width;
        this.data = data;
    }
    copyLocation() {
        let retMem = new GPUMemory(this.width, []);
        retMem.offset = this.offset;
        return retMem;
    }
    split(splitWidth) {
        if (this.width <= splitWidth) {
            throw ("splitwidth too wide");
        }
        return new GPUMemory(this.offset + splitWidth, []);
    }
}
exports.GPUMemory = GPUMemory;
