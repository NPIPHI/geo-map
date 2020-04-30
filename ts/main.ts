import { mapRenderer } from "./renderer"
import { bufferConstructor } from "./bufferConstructor"
import { camera } from "./camera"
import { loadMap, parseMapJson, loadMapChuncks } from "./mapLoad";
import { GPUBufferSet } from "./memory"
import { mapLayer } from "./map"
import { inflate } from "zlib";
import { Feature } from "./feature";

export var gl: WebGL2RenderingContext;
var renderer: mapRenderer;
var canvas: HTMLCanvasElement;
var map: mapLayer;
var selectedElement: Feature;

var cam = {x: 0, y: 0, scaleX: 1, scaleY: 1}
var baseCam = {x: 0, y: 0}
var mouse = {x: 0, y: 0, down: false}
var invalidated = false;
var drawParams = {
    outline: true,
    poly: true
}


window.addEventListener("keydown", key=>{
    if(key.key == "r"){
        cam = {x: 0, y: 0, scaleX: 1, scaleY: 1}
        baseCam = {x: 0, y: 0}
    }
    if(key.key == "p"){
        drawParams.poly = !drawParams.poly;
    }
    if(key.key == "o"){
        drawParams.outline = !drawParams.outline;
    }
        invalidate();
})

window.addEventListener("resize", evt=>{
    camera.setAespectRatio(window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height)
    invalidate();
});

window.addEventListener("wheel", mouse=>{
    let zoom = Math.pow(1.01, -mouse.deltaY)
    cam.scaleX *= zoom;
    cam.scaleY *= zoom;
    invalidate();
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
})

window.addEventListener("pointerdown", pointer=>{
    if(pointer.button === 0){
        mouse.down = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2/1000 / cam.scaleX;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2/1000 / cam.scaleY;
    } else if(pointer.button === 1){
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.setStyle(map.select(adjustedPointer.x, adjustedPointer.y), 2);
        invalidate();
    } else {
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.remove(adjustedPointer.x, adjustedPointer.y);
        invalidate();
    }
})

window.addEventListener("contextmenu", (e)=>{e.preventDefault(); return false})

window.addEventListener("pointerup", pointer=>{
    if(pointer.button === 0){
        mouse.down = false;
        baseCam = {x: cam.x, y: cam.y}
        window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
    }
})

window.addEventListener("pointermove", pointer=>{
    if(mouse.down){
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2/1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2/1000 / cam.scaleX;
        invalidate();
    }
    let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
    let selection = map.select(adjustedPointer.x, adjustedPointer.y);
    if(selection !== selectedElement){
        map.setStyle(selection, 2);
        map.setStyle(selectedElement, 0);
        console.log(selection)
        selectedElement = selection;
        invalidate();
    }
})

function init() {
    if(window.sessionStorage.getItem("VIEW")){
        cam = JSON.parse(window.sessionStorage.getItem("VIEW"));
        baseCam = {x: cam.x, y: cam.y}
    }
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.setAespectRatio(window.innerWidth, window.innerHeight);
    document.body.appendChild(canvas);
    gl = canvas.getContext("webgl2");
    renderer = new mapRenderer(gl);
    map = loadMapChuncks("./chuncks")
    loop();
}

export function invalidate(){
    invalidated = true;
}

function loop(){
    if(invalidated){
        renderer.clear();
        renderer.renderMap(map, camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY), drawParams.poly, drawParams.outline);
        invalidated = false;
        console.log(performance.now())
    }
    requestAnimationFrame(loop);
}

console.log(performance.now());
init();

