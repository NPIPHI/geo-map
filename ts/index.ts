import { Feature } from "./feature";
import { mapLayer } from "./map";
import { mapRenderer } from "./renderer";
import { addMapBinary, addMapJson, loadMapChuncksBinary, loadMapChuncksJSON, loadMapBinary } from "./mapLoad";
import { bufferConstructor } from "./bufferConstructor";
import { camera } from "./camera";
import { inputHandler } from "./inputHandler";

export var gl: WebGL2RenderingContext;

export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Layer {
    zIndex: number;
    name: string;
    addFeatures(pointStrips: Float64Array[], ids: string[]): void;
    addFeature(feature: Feature): void;
    createFeature(pointStrip: Float64Array, id: string): Feature;
    selectByPoint(x: number, y: number): Feature;
    selectByRectangle(boundingBox: BoundingBox): Feature[];
    selectByID(id: string): Feature;
    remove(feature: Feature): void;
    setStyle(feature: Feature, style: number): void;
    addEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", callback: (arg0: Feature)=>void): void;
    callEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", point: {x: number, y: number}): void;
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void;
    setStyleTableFromArray(type: "polygon" | "outline", inArray: number[], outArray: number[]): void;
}

export class GeoMap{
    layers: Layer[] = [];
    private gl: WebGL2RenderingContext;
    private bBox: BoundingBox;
    private squareRegion: BoundingBox;
    private renderer: mapRenderer;
    private camera: camera;
    private bufferConstructor: bufferConstructor;
    private inputHandler: inputHandler;
    private canvas: HTMLCanvasElement;
    private invalidated: boolean = false;
    constructor(canvas: HTMLCanvasElement, region: BoundingBox){
        //region represents the bounding box containing the elemnts of the map
        //accurate region information improves feature selection performance (~10x)
        //it is possible to add elements outside of the region
        //the view is automaticly set to show the region
        this.bBox = region;
        this.canvas = canvas;
        if(this.bBox.x2 - this.bBox.x1 > this.bBox.y2 - this.bBox.y1){
            let yCenter = (this.bBox.y1 + this.bBox.y2)/2;
            let yOffset = (this.bBox.x2 - this.bBox.x1)/2;
            this.squareRegion = {x1: this.bBox.x1, y1: yCenter - yOffset, x2:this.bBox.x2, y2: yCenter + yOffset};
        } else {
            let xCenter = (this.bBox.x1 + this.bBox.x2)/2;
            let xOffset = (this.bBox.y2 - this.bBox.y1)/2;
            this.squareRegion = {y1: this.bBox.y1, x1: xCenter - xOffset, y2:this.bBox.y2, x2: xCenter + xOffset};
        }
        this.gl = canvas.getContext("webgl2");
        gl = this.gl;
        this.renderer = new mapRenderer(this.gl);
        this.camera = new camera(this.squareRegion);
        this.camera.setAespectRatio(canvas.width, canvas.height);
        this.bufferConstructor = new bufferConstructor(this.squareRegion);
        this.inputHandler = new inputHandler(canvas, this.camera, this.invalidate.bind(this));
        this.loop();
    }

    private loop(){
        this.inputHandler.pollEvents();
        if(this.invalidated){
            this.render();
            this.invalidated = false;
        }
        requestAnimationFrame(this.loop.bind(this));
    }

    private invalidate(){
        this.invalidated = true;
    }

    private render(){
        this.layers.sort((a, b)=>a.zIndex - b.zIndex);
        let view = this.camera.view
        this.renderer.clear();
        this.layers.forEach(layer=>{
            this.renderer.renderMap(layer as mapLayer, view, true, true);
        })
    }
    createLayer(name: string, zIndex: number = 0): Layer {
        return new mapLayer(name, this.bBox, this.bufferConstructor, this.invalidate.bind(this), zIndex);
    }
    addLayer(layer: Layer): void{
        this.layers.push(layer);
        this.inputHandler.targets.push(layer);
    }
    async addData(layer: Layer, geometry: Float64Array[], ids: string[]): Promise<void>{
        return new Promise(resolve=>{
            layer.addFeatures(geometry, ids);
            this.invalidate();
            resolve();
        });
    }
    async loadData(layer: Layer, path: string, encoding: "binary" | "json"): Promise<void>{
        let invalidate = this.invalidate.bind(this);
        if(encoding === "binary"){
            return new Promise(resolve=>{
                addMapBinary(path, layer).then(()=>{invalidate(); resolve()});
            });
        }
        if(encoding === "json"){
            return new Promise(resolve=>{
                addMapJson(path, layer).then(()=>{invalidate(); resolve()});
            });
        }
    }

    async loadDataChuncks(layer: Layer, dir: string, encoding: "binary" | "json"): Promise<void>{
        let invalidate = this.invalidate.bind(this);
        if(encoding === "binary"){
            return loadMapChuncksBinary(dir, layer, invalidate);
        }
        if(encoding === "json"){
            return loadMapChuncksJSON(dir, layer, invalidate);
        }
    }
}