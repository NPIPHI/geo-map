import { mapRenderer } from "./renderer"
import { bufferConstructor } from "./bufferConstructor"
import { camera } from "./camera"
import { loadMap } from "./mapLoad";
import { GPUBufferSet } from "./memory"
import { geoMap } from "./map"

export var gl: WebGL2RenderingContext;
var renderer: mapRenderer;
var canvas: HTMLCanvasElement;
var map: geoMap;

var cam = {x: 0, y: 0, scaleX: 1, scaleY: 1}
var baseCam = {x: 0, y: 0}
var mouse = {x: 0, y: 0, down: false}
var invalidated = true;
var drawParams = {
    outline: false,
    line: false,
    poly: true
}

{
window.addEventListener("keydown", key=>{
    if(key.key == "r"){
        cam = {x: 0, y: 0, scaleX: 1, scaleY: 1}
        baseCam = {x: 0, y: 0}
    }
    if(key.key == "l"){
        drawParams.line = !drawParams.line;
    }
    if(key.key == "p"){
        drawParams.poly = !drawParams.poly;
    }
    if(key.key == "o"){
        drawParams.outline = !drawParams.outline;
    }
    invalidated = true;
})

window.addEventListener("resize", evt=>{
    camera.setAespectRatio(window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    invalidated = true;
});

window.addEventListener("wheel", mouse=>{
    let zoom = Math.pow(1.01, -mouse.deltaY)
    cam.scaleX *= zoom;
    cam.scaleY *= zoom;
    invalidated = true;
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
})

window.addEventListener("pointerdown", pointer=>{
    mouse.down = true;
    mouse.x = pointer.offsetX;
    mouse.y = pointer.offsetY;
    cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2/1000 / cam.scaleX;
    cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2/1000 / cam.scaleY;
})

window.addEventListener("pointerup", pointer=>{
    mouse.down = false;
    baseCam = {x: cam.x, y: cam.y}
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
})

window.addEventListener("pointermove", pointer=>{
    if(mouse.down){
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2/1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2/1000 / cam.scaleX;
        invalidated = true;
    }
})
}

async function init() {
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
    let time1 = performance.now();
    let points = await loadMap();
    map = new geoMap(points);
    let time2 = performance.now();
    console.log(time2-time1);
    loop();
}

function loop(){
    if(invalidated){
        renderer.clear();
        renderer.renderMap(map, camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY));
        invalidated = false;
    }
    requestAnimationFrame(loop);
}

init();
