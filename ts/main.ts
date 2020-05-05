import { mapRenderer } from "./renderer"
import { camera } from "./camera"
import { loadMapChuncks, loadMapChuncksBinary } from "./mapLoad";
import { mapLayer } from "./map"
import { boundingBox } from "./kdTree";

export var gl: WebGL2RenderingContext;
var renderer: mapRenderer;
var canvas: HTMLCanvasElement;
var tileMap: mapLayer;
var featureMap: mapLayer;
var cam: camera;

var mouse = { startx: 0, starty: 0, x: 0, y: 0, left: false, right: false }
var invalidated = false;
var drawParams = { tile: true, feature: true, lines: true, polygons: true }
var paintMode = false;
var sprayMode = false;
var featureInfoTracker = {addedIndex: 0, totalCount: 0, displayedCount: 0}

let zoom = 1;
let targetZoom = 1;

function init() {
    canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2");
    if(!gl){
        window.alert("this browser does not support webgl 2, try firefox")
    }
    document.body.appendChild(canvas);
    cam = new camera();
    sizeCanvas();
    //cam.zoom(0.001, 0, 0);
    mouse.x = canvas.width/2;
    mouse.y = canvas.height/2;
    mouse.startx = canvas.width/2;
    mouse.starty = canvas.height/2;
    console.log(performance.now())
    tileMap = loadMapChuncksBinary("./binaryChuncks");
    //tileMap = loadMapChuncks("./chuncks")
    featureMap = new mapLayer([], []);
    renderer = new mapRenderer(gl);
    tileMap.setStyleTableFromArray("polygon", [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.8, 0.8, 0.8, 1, 0.9, 0.9, 0.9, 1], [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.5, 0.5, 1]);
    tileMap.setStyleTableFromArray("outline", [0, 0, 0.6, 2, 0, 1, 0, 3, 0, 0, 1, 8, 0, 0, 0.6, 2, 0, 0, 0.6, 2], [0.4, 0.2, 0.0, 0, 0, 1, 1, 0, 1, 0, 1, 0,  1, 0, 0, 0, 1, 0, 0, 0]);
    featureMap.setStyleTableFromArray("polygon", [1, 0.5, 0.5, 1, 0, 0, 1, 1], [1, 0.5, 0.5, 0, 1, 1, 1, 0])
    featureMap.setStyleTableFromArray("outline", [1, 0, 0, 4, 0, 1, 0, 4], [1, 0, 0, 0, 1, 1, 1, 0])
    window.onload = loop;
}

export function invalidate() {
    invalidated = true;
}

export function incrementFeatureNumberDisplay(featureNumberDelta: number) {
    featureInfoTracker.totalCount += featureNumberDelta;
}

export function setHoveredElement(id: string) {
    document.getElementById("HoveredElement").innerHTML = id;
}

function sizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    cam.setAespectRatio(canvas.width, canvas.height);
    gl.viewport(0, 0, canvas.width, canvas.height);
    invalidate();
}

let lastState: any = {};
function manageSidebar() {
    if(featureInfoTracker.displayedCount != featureInfoTracker.totalCount){
        document.getElementById("TileNumber").innerHTML = featureInfoTracker.totalCount as any;
        featureInfoTracker.displayedCount = featureInfoTracker.totalCount;
    }
    let state: any = {};
    let lower = (document.getElementById("lower") as HTMLInputElement).value;
    let upper = (document.getElementById("upper") as HTMLInputElement).value;
    let lowerBound = state.lower = Math.exp(parseFloat(lower));
    let upperBound = state.upper = Math.exp(parseFloat(upper));
    renderer.setTransitionBoundry(lowerBound, upperBound);
    document.getElementById("ZoomLevel").innerHTML = Math.log(cam.getZoom()).toFixed(1) as any;
    state.lines = drawParams.lines = (document.getElementById("lines") as any).checked;
    state.polygons = drawParams.polygons = (document.getElementById("polygons") as any).checked;
    state.feature = drawParams.feature = (document.getElementById("feature") as any).checked;
    state.tile = drawParams.tile = (document.getElementById("tile") as any).checked;
    paintMode = (document.getElementById("paint") as any).checked;
    sprayMode = (document.getElementById("spray") as any).checked;
    if (lastState.lower != state.lower || lastState.upper != state.upper || lastState.lines != state.lines || lastState.polygons != state.polygons || lastState.tile != state.tile || lastState.feature != state.feature) {
        lastState = state;
        invalidate();
    }
}

function loop() {
    manageSidebar();
    let deltaZoom = Math.log(targetZoom/zoom) * 0.1;
    zoom = zoom * Math.exp(deltaZoom);
    if(Math.abs(deltaZoom) > 0.001){
        cam.zoom(Math.exp(deltaZoom), mouse.x, mouse.y)
        invalidate()
    }
    if(invalidated){
        renderer.clear();
        if(drawParams.tile) renderer.renderMap(tileMap, cam.view, drawParams.polygons, drawParams.lines);
        if(drawParams.feature) renderer.renderMap(featureMap, cam.view, drawParams.polygons, drawParams.lines);
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
        let subTile = tileMap.select(x + Math.cos(theta) * offset, y + Math.sin(theta) * offset)
        if(subTile){
            tileMap.setStyle(subTile, 3);
        }
        featureMap.addFeature(featureOutline, "new feature " + featureInfoTracker.addedIndex++);
    }
}

function mouseMove(pointer: {offsetX: number, offsetY: number}){
    mouse.x = pointer.offsetX;
    mouse.y = pointer.offsetY;
    if (mouse.left) {
        cam.touchMove(pointer.offsetX, pointer.offsetY);
        invalidate();
    }
    let adjustedPointer = cam.toWorldSpace(pointer.offsetX, pointer.offsetY);
    if (paintMode) {
        let time1 = performance.now();
        let selection = tileMap.selectRectangle(new boundingBox(adjustedPointer.x - 0.05, adjustedPointer.y - 0.05, adjustedPointer.x + 0.05, adjustedPointer.y + 0.05));
        selection.forEach(ele => {
            tileMap.setStyle(ele, 2);
        })
        console.log(`Selecting ${selection.length} elements took ${performance.now() - time1} miliseconds`)
        invalidate();
    }

    if (sprayMode) {
        sprayFeatures(adjustedPointer.x, adjustedPointer.y, 0.01, 0.001 * (Math.random() + 0.1), 1);
        invalidate();
    }
    let selected = featureMap.select(adjustedPointer.x, adjustedPointer.y);
    if (selected) {
        setHoveredElement(selected.id);
    } else {
        selected = tileMap.select(adjustedPointer.x, adjustedPointer.y)
        if (selected) {
            setHoveredElement(selected.id);
        } else {
            setHoveredElement("none");
        }
    }
}

function mouseDown(pointer: {offsetX: number, offsetY: number, button: number}){
    if (pointer.button === 0) {
        cam.touchDown(pointer.offsetX, pointer.offsetY)
        mouse.left = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        mouse.startx = pointer.offsetX;
        mouse.starty = pointer.offsetY;
    } else if (pointer.button === 2) {
        mouse.right = true;
        let start = performance.now();
        let adjustedPointer = cam.toWorldSpace(pointer.offsetX, pointer.offsetY);
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
        let adjustedPointer = cam.toWorldSpace(pointer.offsetX, pointer.offsetY);
        tileMap.remove(adjustedPointer.x, adjustedPointer.y);
        console.log(`selecting and removing 1 feature took ${performance.now()-start} ms`);
        invalidate();
    }
}

function mouseUp(pointer: {offsetX: number, offsetY: number, button: number}){
    if (pointer.button === 0) {
        mouse.left = false;
    } 
    if (pointer.button === 2) {
        mouse.right = false;
    }
}

function mouseScroll(mouse: {deltaY: number}){
    targetZoom *= Math.pow(1.01, -mouse.deltaY);
    invalidate();
}

init();

window.addEventListener("resize", sizeCanvas);

canvas.addEventListener("wheel", mouseScroll)

canvas.addEventListener("pointerdown", mouseDown)

canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); return false })

canvas.addEventListener("pointerup", mouseUp)

canvas.addEventListener("pointermove", mouseMove)


let pinchDistance: number;
let touch1: Touch;
let touch2: Touch;
canvas.addEventListener("touchstart", event=>{
    event.preventDefault();
    let t1ID = null;
    let t2ID = null;
    if(touch1){
        t1ID = touch1.identifier;
    }
    if(touch2){
        t2ID = touch2.identifier;
    }
    touch1 = undefined;
    touch2 = undefined;
    let newTouch;
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if(touch.identifier == t1ID){
            touch1 = touch;
        } else if(touch.identifier == t2ID){
            touch2 = touch;
        } else {
            newTouch = touch;
        }
    }
    if(!touch1){
        touch1 = newTouch;
        mouseDown({offsetX: event.touches[0].clientX, offsetY: event.touches[0].clientY, button: 0})
    } else if(!touch2){
        touch2 = newTouch;
        let x = (touch1.clientX - touch2.clientX);
        let y = (touch1.clientY - touch2.clientY);
        pinchDistance = Math.sqrt(x*x + y*y);
    }
})
canvas.addEventListener("touchmove", event=>{
    let t1ID = null;
    let t2ID = null;
    if(touch1){
        t1ID = touch1.identifier;
    }
    if(touch2){
        t2ID = touch2.identifier;
    }
    touch1 = undefined;
    touch2 = undefined;
    let newTouch;
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if(touch.identifier == t1ID){
            touch1 = touch;
        } else if(touch.identifier == t2ID){
            touch2 = touch;
        } else {
            newTouch = touch;
        }
    }
    if(touch1 && touch2){
        let x = (touch1.clientX - touch2.clientX);
        let y = (touch1.clientY - touch2.clientY);
        let newDistance = Math.sqrt(x*x + y*y);
        mouseScroll({deltaY: Math.log(pinchDistance/newDistance) * 100})
        pinchDistance = newDistance;
    }
    if(touch1){
        let x = touch1.clientX;
        let y = touch1.clientY;
        mouseMove({offsetX: x, offsetY: y})
    }
})
canvas.addEventListener("touchend", event=>{
    let t1ID;
    let t2ID;
    if(touch1){
        t1ID = touch1.identifier;
    }
    if(touch2){
        t2ID = touch2.identifier;
    }
    touch1 = undefined;
    touch2 = undefined;
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if(touch.identifier == t1ID){
            touch1 = touch;
        }
        if(touch.identifier == t2ID){
            touch2 = touch;
        }
    }
    if(touch1){

    } else if(touch2){
        mouseUp({offsetX: mouse.x, offsetY: mouse.y, button: 0})
        mouseDown({offsetX: touch2.clientX, offsetY: touch2.clientY, button: 0})
        touch1 = touch2;
    } else {
        mouseUp({offsetX: mouse.x, offsetY: mouse.y, button: 0})
    }
});

// var lastGestureScale: number;
// canvas.addEventListener("gesturestart", gesture=>{
//     lastGestureScale = 1;
// })
// canvas.addEventListener("gesturechange", gesture=>{
//     mouseScroll({deltaY: (Math.log(lastGestureScale / (gesture as any).scale) * 100)});
//     lastGestureScale = (gesture as any).scale;
// })