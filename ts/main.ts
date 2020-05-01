import { mapRenderer } from "./renderer"
import { camera } from "./camera"
import { loadMapChuncks } from "./mapLoad";
import { mapLayer } from "./map"
import { boundingBox } from "./kdTree";

export var gl: WebGL2RenderingContext;
var renderer: mapRenderer;
var canvas: HTMLCanvasElement;
var tileMap: mapLayer;
var featureMap: mapLayer;

var cam = { x: -0.5, y: -0.2, scaleX: 1, scaleY: 1 }
var baseCam = { x: -0.5, y: -0.2 }
var mouse = { x: 0, y: 0, left: false, right: false }
var invalidated = false;
var drawParams = { lines: true, polygons: true }
var paintMode = false;
var sprayMode = false;

let zoom = 2.7;
let targetZoom = 2.7;

function init() {
    // if (window.sessionStorage.getItem("VIEW")) {
    //     cam = JSON.parse(window.sessionStorage.getItem("VIEW"));
    // }
    canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2");
    if(!gl){
        window.alert("this browser does not support webgl 2, try firefox")
    }
    document.body.appendChild(canvas);
    sizeCanvas();

    renderer = new mapRenderer(gl);
    tileMap = loadMapChuncks("./chuncks");
    featureMap = new mapLayer([], []);
    tileMap.setStyleTableFromArray("polygon", [0.9, 0.9, 0.9, 1, 0, 1, 1, 1, 1, 0, 1, 1], [0.9, 0.9, 0.9, 1, 1, 0, 1, 1, 1, 0, 0, 1]);
    tileMap.setStyleTableFromArray("outline", [0, 0, 0.6, 2, 0, 1, 0, 3, 0, 0, 1, 8], [0.4, 0.2, 0.0, 0, 0, 1, 1, 0, 1, 0, 1, 0]);
    featureMap.setStyleTableFromArray("polygon", [1, 0.5, 0.5, 1, 0, 0, 1, 1], [1, 0.5, 0.5, 0, 1, 1, 1, 0])
    featureMap.setStyleTableFromArray("outline", [1, 0, 0, 4, 0, 1, 0, 4], [1, 0, 0, 1, 1, 1, 1, 0])
    window.onload = loop;
}

export function invalidate() {
    invalidated = true;
}

export function setFeatureNumberDisplay(featureNumber: number) {
    document.getElementById("TileNumber").innerHTML = featureNumber as any;
}

export function setHoveredElement(id: string) {
    document.getElementById("HoveredElement").innerHTML = id;
}

function sizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    camera.setAespectRatio(canvas.width, canvas.height);
    gl.viewport(0, 0, canvas.width, canvas.height);
    invalidate();
}

let lastState: any = {};
function manageSidebar() {
    let state: any = {};
    let lower = (document.getElementById("lower") as HTMLInputElement).value;
    let upper = (document.getElementById("upper") as HTMLInputElement).value;
    let lowerBound = state.lower = Math.exp(parseFloat(lower));
    let upperBound = state.upper = Math.exp(parseFloat(upper));
    renderer.setTransitionBoundry(lowerBound, upperBound);
    document.getElementById("ZoomLevel").innerHTML = Math.log(cam.scaleX).toFixed(1) as any;
    state.lines = drawParams.lines = (document.getElementById("lines") as any).checked;
    state.polygons = drawParams.polygons = (document.getElementById("polygons") as any).checked;
    paintMode = (document.getElementById("paint") as any).checked;
    sprayMode = (document.getElementById("spray") as any).checked;
    if (lastState.lower != state.lower || lastState.upper != state.upper || lastState.lines != state.lines || lastState.polygons != state.polygons) {
        lastState = state;
        invalidate();
    }
}

function loop() {
    manageSidebar();
    zoom = zoom + (targetZoom - zoom) * 0.1;
    if(Math.abs(zoom - targetZoom) > 0.01){
        invalidate()
    }
    cam.scaleX = zoom;
    cam.scaleY = zoom;
    if(invalidated){
        renderer.clear();
        renderer.renderMap(tileMap, camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY), drawParams.polygons, drawParams.lines);
        renderer.renderMap(featureMap, camera.getView(cam.x, cam.y, cam.scaleX, cam.scaleY), drawParams.polygons, drawParams.lines);
        invalidated = false;
    }
    requestAnimationFrame(loop);
}

function sprayFeatures(x: number, y: number, radius: number, scale: number, count: number = 1){
    for(let i = 0; i < count; i++){
        let featureOutline = new Float32Array([0, 0, 0.5, 1, 1, 0])
        let theta = Math.random() * Math.PI * 2;
        let offset = Math.random() * radius;
        for(let i = 0; i < featureOutline.length; i+=2){ 
            featureOutline[i] = featureOutline[i] * scale + x + Math.cos(theta) * offset;
            featureOutline[i+1] = featureOutline[i+1] * scale + y + Math.sin(theta) * offset;
        }
        featureMap.addFeature(featureOutline, "new feature");
    }
}

init();

window.addEventListener("resize", sizeCanvas);

canvas.addEventListener("wheel", mouse => {
    targetZoom *= Math.pow(1.01, -mouse.deltaY);
    invalidate();
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
})

canvas.addEventListener("pointerdown", pointer => {
    if (pointer.button === 0) {
        mouse.left = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleX;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleY;
    } else if (pointer.button === 2) {
        mouse.right = true;
        let start = performance.now();
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        let featureSelection = featureMap.select(adjustedPointer.x, adjustedPointer.y);
        if(featureSelection){
            featureMap.setStyle(featureSelection, 1);
        } else {
            tileMap.setStyle(tileMap.select(adjustedPointer.x, adjustedPointer.y), 2);
        }
        console.log(`selecting and styling 1 feature took ${performance.now()-start} ms`);
        invalidate();
    } else {
        let start = performance.now()
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        tileMap.remove(adjustedPointer.x, adjustedPointer.y);
        console.log(`selecting and removing 1 feature took ${performance.now()-start} ms`);
        invalidate();
    }
})

canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); return false })

canvas.addEventListener("pointerup", pointer => {
    if (pointer.button === 0) {
        mouse.left = false;
        baseCam = { x: cam.x, y: cam.y }
        window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
    } 
    if (pointer.button === 2) {
        mouse.right = false;
    }
})

canvas.addEventListener("pointermove", pointer => {
    if (mouse.left) {
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleX;
        invalidate();
    }
    let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
    if (paintMode) {
        let time1 = performance.now();
        let selection = tileMap.selectRectangle(new boundingBox(adjustedPointer.x - 0.1, adjustedPointer.y - 0.1, adjustedPointer.x + 0.1, adjustedPointer.y + 0.1));
        selection.forEach(ele => {
            tileMap.setStyle(ele, 2);
        })
        console.log(`Selecting ${selection.length} elements took ${performance.now() - time1} miliseconds`)
        invalidate();
    }

    if (sprayMode) {
        sprayFeatures(adjustedPointer.x, adjustedPointer.y, 0.01, 0.001, 1);
        invalidate();
    }
    let selected = tileMap.select(adjustedPointer.x, adjustedPointer.y);
    if (selected) {
        setHoveredElement(selected.id);
    } else {
        setHoveredElement("none");
    }
})