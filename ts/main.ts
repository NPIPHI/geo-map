import { mapRenderer } from "./renderer"
import { bufferConstructor } from "./bufferConstructor"
import { camera } from "./camera"
import { loadMap, parseMapJson, loadMapChuncks } from "./mapLoad";
import { GPUBufferSet } from "./memory"
import { mapLayer } from "./map"
import { inflate } from "zlib";
import { Feature } from "./feature";
import { boundingBox } from "./kdTree";

export var gl: WebGL2RenderingContext;
var renderer: mapRenderer;
var canvas: HTMLCanvasElement;
var map: mapLayer;

var cam = { x: 0, y: 0, scaleX: 1, scaleY: 1 }
var baseCam = { x: 0, y: 0 }
var mouse = { x: 0, y: 0, down: false }
var invalidated = false;
var drawParams = { lines: true, polygons: true }
var paintMode = false;

function sizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    camera.setAespectRatio(canvas.width, canvas.height);
    gl.viewport(0, 0, canvas.width, canvas.height);
    invalidate();
}

function init() {
    if (window.sessionStorage.getItem("VIEW")) {
        cam = JSON.parse(window.sessionStorage.getItem("VIEW"));
        baseCam = { x: cam.x, y: cam.y }
    }
    canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2");
    document.body.appendChild(canvas);
    sizeCanvas();

    renderer = new mapRenderer(gl);
    map = loadMapChuncks("./chuncks")
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
    if (lastState.lower != state.lower || lastState.upper != state.upper || lastState.lines != state.lines || lastState.polygons != state.polygons) {
        state = lastState;
        invalidate();
    }
}

function loop() {
    manageSidebar();
    if (invalidated) {
        renderer.clear();
        renderer.renderMap(map, camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY), drawParams.polygons, drawParams.lines);
        invalidated = false;
    }
    requestAnimationFrame(loop);
}

init();

window.addEventListener("resize", sizeCanvas);

canvas.addEventListener("wheel", mouse => {
    let zoom = Math.pow(1.01, -mouse.deltaY)
    cam.scaleX *= zoom;
    cam.scaleY *= zoom;
    invalidate();
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
})

canvas.addEventListener("pointerdown", pointer => {
    if (pointer.button === 0) {
        mouse.down = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleX;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleY;
    } else if (pointer.button === 2) {
        let start = performance.now()
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.setStyle(map.select(adjustedPointer.x, adjustedPointer.y), 2);
        console.log(`selecting and styling 1 feature took ${performance.now()-start} ms`);
        invalidate();
    } else {
        let start = performance.now()
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.remove(adjustedPointer.x, adjustedPointer.y);
        console.log(`selecting and removing 1 feature took ${performance.now()-start} ms`);
        invalidate();
    }
})

canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); return false })

canvas.addEventListener("pointerup", pointer => {
    if (pointer.button === 0) {
        mouse.down = false;
        baseCam = { x: cam.x, y: cam.y }
        window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
    }
})

canvas.addEventListener("pointermove", pointer => {
    if (mouse.down) {
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleX;
        invalidate();
    }
    if (paintMode) {
        let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        let time1 = performance.now();
        let selection = map.selectRectangle(new boundingBox(adjustedPointer.x - 0.025, adjustedPointer.y - 0.025, adjustedPointer.x + 0.025, adjustedPointer.y + 0.025));
        selection.forEach(ele => {
            map.setStyle(ele, 2);
        })
        console.log(`Selecting ${selection.length} elements took ${performance.now() - time1} miliseconds`)
        invalidate();
    }

    let adjustedPointer = camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
    let selected = map.select(adjustedPointer.x, adjustedPointer.y);
    if (selected) {
        setHoveredElement(selected.id);
    } else {
        setHoveredElement("none");
    }
})