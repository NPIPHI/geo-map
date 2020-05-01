"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const camera_1 = require("./camera");
const mapLoad_1 = require("./mapLoad");
var renderer;
var canvas;
var map;
var selectedElement;
var cam = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
var baseCam = { x: 0, y: 0 };
var mouse = { x: 0, y: 0, down: false };
var invalidated = false;
var keys = { p: true, o: true };
window.addEventListener("keydown", key => {
    if (key.key == "r") {
        cam = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
        baseCam = { x: 0, y: 0 };
    }
    keys[key.key] = !keys[key.key];
    invalidate();
});
window.addEventListener("resize", sizeCanvas);
window.addEventListener("wheel", mouse => {
    let zoom = Math.pow(1.01, -mouse.deltaY);
    cam.scaleX *= zoom;
    cam.scaleY *= zoom;
    invalidate();
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
});
window.addEventListener("pointerdown", pointer => {
    if (pointer.button === 0) {
        mouse.down = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleX;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleY;
    }
    else if (pointer.button === 1) {
        let adjustedPointer = camera_1.camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.setStyle(map.select(adjustedPointer.x, adjustedPointer.y), 2);
        invalidate();
    }
    else {
        let adjustedPointer = camera_1.camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        map.remove(adjustedPointer.x, adjustedPointer.y);
        invalidate();
    }
});
window.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
window.addEventListener("pointerup", pointer => {
    if (pointer.button === 0) {
        mouse.down = false;
        baseCam = { x: cam.x, y: cam.y };
        window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
    }
});
window.addEventListener("pointermove", pointer => {
    if (mouse.down) {
        cam.x = baseCam.x + (pointer.offsetX - mouse.x) * 2 / 1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.y) * 2 / 1000 / cam.scaleX;
        invalidate();
    }
});
function sizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    camera_1.camera.setAespectRatio(canvas.width, canvas.height);
    exports.gl.viewport(0, 0, canvas.width, canvas.height);
    invalidate();
}
function init() {
    if (window.sessionStorage.getItem("VIEW")) {
        cam = JSON.parse(window.sessionStorage.getItem("VIEW"));
        baseCam = { x: cam.x, y: cam.y };
    }
    canvas = document.createElement("canvas");
    exports.gl = canvas.getContext("webgl2");
    document.body.appendChild(canvas);
    sizeCanvas();
    renderer = new renderer_1.mapRenderer(exports.gl);
    map = mapLoad_1.loadMapChuncks("./chuncks");
    loop();
}
function invalidate() {
    invalidated = true;
}
exports.invalidate = invalidate;
function setDisplayData(featureNumber) {
    document.getElementById("TileNumber").innerHTML = featureNumber;
}
exports.setDisplayData = setDisplayData;
function loop() {
    if (invalidated) {
        renderer.clear();
        renderer.renderMap(map, camera_1.camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY), !!keys['p'], !!keys['o']);
        invalidated = false;
    }
    requestAnimationFrame(loop);
}
init();
