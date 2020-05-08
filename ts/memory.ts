import {gl} from "./index"

const growthRatio = 1.1;
const preallocatedSize = 0;
export class GPUBufferSet{
    private bufferSize: number;
    private bufferDeleteQueue: WebGLBuffer[];
    lockDepth: number = 0;
    head: number;
    private holes: Map<number, number[]>;
    buffers: {byteSize: number, buffer: WebGLBuffer}[];
    private constructor(elementWidths: number[], buffers: WebGLBuffer[], size: number, head: number = 0){
        elementWidths.forEach(ele=>{
            if(ele%4){
                console.warn("The Index Width supplied was not a multipule of 4, element widths are in bytes")
            }
        })
        this.buffers = [];
        for(let i = 0; i < elementWidths.length; i ++){
            this.buffers.push({byteSize: elementWidths[i], buffer: buffers[i]})
        }
        this.bufferSize = size;
        this.holes = new Map<number, number[]>();
        this.head = head;
        this.bufferDeleteQueue = [];
    }
    static create(elementWidths: number[]){
        let buffers = elementWidths.map(byteSize=>{
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, preallocatedSize * byteSize, gl.STATIC_DRAW);
            return buffer;
        })
        return new GPUBufferSet(elementWidths, buffers, preallocatedSize);
    }
    static createFromSize(elementWidths: number[], size: number){
        let buffers = elementWidths.map(byteSize=>{
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, size * byteSize, gl.STATIC_DRAW);
            return buffer;
        })
        return new GPUBufferSet(elementWidths, buffers, size);
    }
    static createFromBuffers(elementWidths: number[], buffers: WebGLBuffer[], size: number){//size in indices
        return new GPUBufferSet(elementWidths, buffers, size, size);
    }
    destructiveConcat(source: GPUBufferSet){//will not update the memory locations of the source objects SUS BROKE DONT USE
        if(this.head + source.head > this.bufferSize){
            this.reallocateBuffers(this.head + source.head);
        }
        for(let i = 0; i < this.buffers.length; i++){
            gl.bindBuffer(gl.COPY_READ_BUFFER, source.buffers[i].buffer);
            gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.buffers[i].buffer);
            gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, this.head, source.head * source.buffers[i].byteSize);
            source.deleteBuffer(source.buffers[i].buffer);
            source.buffers[i].buffer = null;
        }
        source.holes.forEach((offsets, width)=>{
            let bucket = this.holes.get(width);
            if(!bucket){
                this.holes.set(width, []);
                bucket = this.holes.get(width);
            }
            offsets.forEach(offset=>{
                bucket.push(offset + this.head)
            })
        })
        this.head += source.head;
        source.freeGPUMemory();
    }
    freeGPUMemory(){
        if(this.lockDepth===0){
            this.bufferDeleteQueue.forEach(buffer=>{
                gl.deleteBuffer(buffer);
            })
            this.bufferDeleteQueue = [];
        } else {
            setTimeout(()=>this.freeGPUMemory(), 100);
            console.warn("GPU memory in use, trying again in 100ms")
        }
    }
    remove(location: GPUMemoryObject | GPUMemoryPointer){
        this.zeroMemory(location);
        if(this.head == location.GPUWidth + location.GPUOffset){
            this.head -= location.GPUWidth;
        } else {
            let holeArray = this.holes.get(location.GPUWidth);
            if(holeArray){
                holeArray.push(location.GPUOffset);
            } else {
                this.holes.set(location.GPUWidth, [location.GPUOffset]);
            }
        }
        location.GPUOffset = -1;
    }
    removeArray(locations: (GPUMemoryObject | GPUMemoryPointer)[]){
        locations.forEach(location=>this.remove(location));
    }
    add(location: GPUMemoryObject){
        if(location.GPUOffset!=-1){
            throw("location alredy added")
        }
        let swapLocation = this.holes.get(location.GPUWidth);
        if(swapLocation && swapLocation.length){
            this.fillHole(swapLocation.pop(), location);
        } else {
            location.GPUOffset = this.head;
            this.head += location.GPUWidth;
            this.putMemory(location);
        }
    }
    addArray(locations: GPUMemoryObject[]){
        let unifiedWidth = locations.reduce((accumulator, location)=>accumulator+location.GPUWidth, 0);
        let insertHead: number;

        let swapLocation = this.holes.get(unifiedWidth);
        if(swapLocation && swapLocation.length){
            insertHead = swapLocation.pop();
        } else {
            insertHead = this.head;
            this.head += unifiedWidth;
        }
        let localHead = 0;
        locations.forEach(location => {
            location.GPUOffset = localHead + insertHead;
            localHead += location.GPUWidth;
        })
        let unifiedArrays: (Float32Array | Int32Array)[] = [];
        for(let i = 0; i < locations[0].GPUData.length; i++){
            let attribArray: Float32Array | Int32Array;
            if(locations[0].GPUData[i] instanceof Float32Array){
                attribArray = new Float32Array(unifiedWidth * this.buffers[i].byteSize/4);
            }
            if(locations[0].GPUData[i] instanceof Int32Array){
                attribArray = new Int32Array(unifiedWidth * this.buffers[i].byteSize/4);
            }
            let offset = 0;
            locations.forEach(location=>{
                attribArray.set(location.GPUData[i],offset);
                offset += location.GPUData[i].length;
            })
            unifiedArrays.push(attribArray);
        }
        this.putMemoryChunck(insertHead, unifiedWidth, unifiedArrays);
    }
    addRaw(data: (Float32Array | Int32Array)[]): GPUMemoryPointer{
        let width = 4*data[0].length/this.buffers[0].byteSize
        this.putMemoryChunck(this.head, width, data);
        this.head += width;
        return new GPUMemoryPointer(this.head - width, width);
    }
    update(location: GPUMemoryObject, attribute?: number){
        if(typeof attribute === "number"){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attribute].buffer)
            gl.bufferSubData(gl.ARRAY_BUFFER, location.GPUOffset * this.buffers[attribute].byteSize, location.GPUData[attribute]);
        } else {
            this.putMemory(location);
        }
    }
    lock(){
        this.lockDepth++;
    }
    unlock(){
        this.lockDepth--;
        if(this.lockDepth==0){
            this.bufferDeleteQueue.forEach(buffer=>{
                gl.deleteBuffer(buffer);
            })
            this.bufferDeleteQueue = [];
        }
    }
    private reallocateBuffers(minSize: number){
        this.resizeBuffers(Math.max(Math.floor(this.bufferSize * growthRatio), minSize));
    }
    private resizeBuffers(size: number){
        this.buffers.forEach(buffer=>{
            let newBuffer = gl.createBuffer();
            gl.bindBuffer(gl.COPY_WRITE_BUFFER, newBuffer);
            gl.bufferData(gl.COPY_WRITE_BUFFER, size * buffer.byteSize, gl.STATIC_COPY);
            gl.bindBuffer(gl.COPY_READ_BUFFER, buffer.buffer);
            gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, this.bufferSize * buffer.byteSize);
            this.deleteBuffer(buffer.buffer);
            buffer.buffer = newBuffer;
        });
        this.bufferSize = size;
    }
    private deleteBuffer(buffer: WebGLBuffer){
        if(this.lockDepth){
            this.bufferDeleteQueue.push(buffer);
        } else {
            gl.deleteBuffer(buffer);
        }
    }
    private zeroMemory(location: GPUMemoryObject | GPUMemoryPointer){
        this.buffers.forEach(buffer=>{
            let clearMemory = new Float32Array(location.GPUWidth * buffer.byteSize/4);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, buffer.byteSize * location.GPUOffset, clearMemory)
        })
    }
    private putMemory(memory: GPUMemoryObject){
        this.putMemoryChunck(memory.GPUOffset, memory.GPUWidth, memory.GPUData);
    }
    private putMemoryChunck(offset: number, width: number, data: (Float32Array | Int32Array)[]){
        while(offset + width > this.bufferSize){
            this.reallocateBuffers(offset + width);
        }
        for(let i = 0; i < this.buffers.length; i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i].buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, this.buffers[i].byteSize * offset, data[i]);
        }
    }
    private fillHole(hole: number, replace: GPUMemoryObject){
        replace.GPUOffset = hole;
        this.putMemory(replace);
    }
    private swap(m1: GPUMemoryObject, m2: GPUMemoryObject){
        if(m1.GPUWidth != m2.GPUWidth){
            throw("incompatable widths")
        }
        let otherOffset = m2.GPUOffset;
        m2.GPUOffset = m1.GPUOffset;
        m1.GPUOffset = otherOffset;
        this.putMemory(m1);
        this.putMemory(m2);
    }
}

export class GPUMemoryPointer{
    GPUOffset: number;
    GPUWidth: number;
    constructor(offset: number, width: number){
        this.GPUOffset = offset;
        this.GPUWidth = width;
    }
    toMemoryObject(data: (Float32Array | Int32Array)[]): GPUMemoryObject{
        let obj = new GPUMemoryObject(this.GPUWidth, data);
        obj.GPUOffset = this.GPUOffset;
        return obj;
    }
}

export interface GPUMemoryObject{
    GPUOffset: number; //must be -1 on an uninnitilized object
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    fromPointer(pointer: GPUMemoryPointer, data: (Float32Array | Int32Array)[]): GPUMemoryObject;
}

export class GPUMemoryObject{
    GPUOffset: number = -1; //must be -1 on an uninnitilized object
    GPUWidth: number;
    GPUData: (Float32Array | Int32Array)[];
    constructor(width: number, data: (Float32Array | Int32Array)[]){
        this.GPUWidth = width;
        this.GPUData = data;
    }
}
/*
preformance:
adding 80000 by array in vector mode takes ~30 ms
adding 80000 individualy in vector mode takes 400 ms
adding 10000 by array in vector mode takes ~4 ms
adding 10000 individualy in vector mode takes 6-11 ms
adding 1 takes 0.03 ms for dense array if memory is cold
adding 1 takes 0.18 ms for very very hole filled array
adding 1 takes 0.005 ms if memory is hot 
adding and removing 1 takes 0.017 ms
removing 10000 elements takes 80 ms
resizing is very very fast
*/