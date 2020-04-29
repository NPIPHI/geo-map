import {gl} from "./main"

export class GPUBufferSet{
    bufferSize: number;
    head: number;
    holes: memoryLocation[];
    buffers: {byteSize: number, buffer: WebGLBuffer}[];
    constructor(elementWidths: number[], bufferSize: number){//element widths: byte size, buffer size in element widths
        elementWidths.forEach(ele=>{
            if(ele%4){
                console.warn("The Index Width supplied was not a multipul of 4, element widths are in bytes")
            }
        })
        this.buffers = elementWidths.map(byteSize=>{
            let buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, bufferSize * byteSize, gl.STATIC_DRAW);
            return {byteSize, buffer};
        })
        this.bufferSize = bufferSize;
        this.holes = [];
        this.head = 0;
    }
    remove(location: memoryLocation){
        if(this.head == location.width + location.offset){
            this.head -= location.width;
        } else {
            this.holes.push(location);
        }
    }
    add(location: memoryLocation){
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
    private clearMemory(offset: number, width: number){
        this.buffers.forEach(buffer=>{
            let clearMemory = new Float32Array(width * buffer.byteSize/4);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, buffer.byteSize * offset, clearMemory)
        })
    }
    private putMemory(memory: memoryLocation){
        for(let i = 0; i < this.buffers.length; i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i].buffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, this.buffers[i].byteSize * memory.offset, memory.data[i])
        }
    }
    private replace(old: memoryLocation, replace: memoryLocation){
        if(old.width != replace.width){
            throw("incompatable widths")
        }
        replace.offset = old.offset;
        old.offset = -1;
        this.putMemory(replace);
    }
    private swap(m1: memoryLocation, m2: memoryLocation){
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

export class memoryLocation{
    offset: number = -1;
    width: number;
    data: Float32Array[] | Int32Array[];
    constructor(width: number, data: Float32Array[] | Int32Array[]){
        this.width = width;
        this.data = data;
    }
    split(splitWidth: number){
        if(this.width <= splitWidth){
            throw("splitwidth too wide")
        }
        return new memoryLocation(this.offset + splitWidth, []);
    }
}