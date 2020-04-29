import {gl} from "./main"

const growthRatio = 1.1;
const preallocatedSize = 100;
export class GPUBufferSet{
    bufferSize: number;
    head: number;
    holes: GPUMemory[];
    buffers: {byteSize: number, buffer: WebGLBuffer}[];
    private constructor(elementWidths: number[], buffers: WebGLBuffer[], size: number){
        elementWidths.forEach(ele=>{
            if(ele%4){
                console.warn("The Index Width supplied was not a multipul of 4, element widths are in bytes")
            }
        })
        this.buffers = [];
        for(let i = 0; i < elementWidths.length; i ++){
            this.buffers.push({byteSize: elementWidths[i], buffer: buffers[i]})
        }
        this.bufferSize = size;
        this.holes = [];
        this.head = 0;
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
        return new GPUBufferSet(elementWidths, buffers, size);
    }
    remove(location: GPUMemory){
        this.clearMemory(location);
        if(this.head == location.width + location.offset){
            this.head -= location.width;
        } else {
            this.holes.push(location.copyLocation());
        }
    }
    removeArray(locations: GPUMemory[]){
        locations.forEach(location=>this.remove(location));
    }
    add(location: GPUMemory){
        if(location.offset!=-1){
            throw("location alredy added")
        }
        let swapLocation = this.holes.find((ele)=>ele.width == location.width);//TODO make constant time
        if(swapLocation){
            this.replace(swapLocation, location);
            this.holes.splice(this.holes.indexOf(swapLocation), 1);
        } else {
            if(this.bufferSize - this.head > location.width){
                location.offset = this.head;
                this.head += location.width;
                this.putMemory(location);
            } else {
                throw("ran out of buffer")//TODO implement realocation of buffer
            }
        }
    }
    addArray(locations: GPUMemory[]){
        let unifiedWidth = locations.reduce((accumulator, location)=>accumulator+location.width, 0);
        let swapLocation = this.holes.find((ele)=>ele.width == unifiedWidth);//will probably fail
        let insertHead: number;
        if(swapLocation){
            insertHead = swapLocation.offset
            this.holes.splice(this.holes.indexOf(swapLocation), 1);
        } else if(this.bufferSize - this.head > unifiedWidth){
            insertHead = this.head;
            this.head += unifiedWidth;
        } else {
            throw("ran out of buffer");
        }
        let localHead = 0;
        locations.forEach(location => {
            location.offset = localHead + insertHead;
            localHead += location.width;
        })
        let unifiedArrays: (Float32Array | Int32Array)[] = [];
        for(let i = 0; i < locations[0].data.length; i++){
            let attribArray: Float32Array | Int32Array;
            if(locations[0].data[i] instanceof Float32Array){
                attribArray = new Float32Array(unifiedWidth * this.buffers[i].byteSize/4);
            }
            if(locations[0].data[i] instanceof Int32Array){
                attribArray = new Int32Array(unifiedWidth * this.buffers[i].byteSize/4);
            }
            let offset = 0;
            locations.forEach(location=>{
                attribArray.set(location.data[i],offset);
                offset += location.data[i].length;
            })
            unifiedArrays.push(attribArray);
        }
        this.putMemoryChunck(insertHead, unifiedArrays);
    }
    private clearMemory(location: GPUMemory){
        this.buffers.forEach(buffer=>{
            let clearMemory = new Float32Array(location.width * buffer.byteSize/4);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, buffer.byteSize * location.offset, clearMemory)
        })
    }
    private putMemory(memory: GPUMemory){
        this.putMemoryChunck(memory.offset, memory.data);
    }
    private putMemoryChunck(offset: number, data: (Float32Array | Int32Array)[]){
        for(let i = 0; i < this.buffers.length; i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i].buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, this.buffers[i].byteSize * offset, data[i]);
        }
    }
    private replace(old: GPUMemory, replace: GPUMemory){
        if(old.width != replace.width){
            throw("incompatable widths")
        }
        replace.offset = old.offset;
        old.offset = -1;
        this.putMemory(replace);
    }
    private swap(m1: GPUMemory, m2: GPUMemory){
        if(m1.width != m2.width){
            throw("incompatable widths")
        }
        let otherOffset = m2.offset;
        m2.offset = m1.offset;
        m1.offset = otherOffset;
        this.putMemory(m1);
        this.putMemory(m2);
    }
}

export class GPUMemory{
    offset: number = -1;
    width: number;
    data: Float32Array[] | Int32Array[];
    constructor(width: number, data: Float32Array[] | Int32Array[]){
        this.width = width;
        this.data = data;
    }
    copyLocation(){
        let retMem = new GPUMemory(this.width, [])
        retMem.offset = this.offset;
        return retMem;
    }
    split(splitWidth: number){
        if(this.width <= splitWidth){
            throw("splitwidth too wide")
        }
        return new GPUMemory(this.offset + splitWidth, []);
    }
}