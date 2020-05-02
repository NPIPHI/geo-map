"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
const camera_1 = require("./camera");
const mapLoad_1 = require("./mapLoad");
const map_1 = require("./map");
const kdTree_1 = require("./kdTree");
var renderer;
var canvas;
var tileMap;
var featureMap;
var cam = { x: -0.5, y: -0.2, scaleX: 1, scaleY: 1 };
var baseCam = { x: -0.5, y: -0.2 };
var mouse = { startx: 0, starty: 0, x: 0, y: 0, left: false, right: false };
var invalidated = false;
var drawParams = { tile: true, feature: true, lines: true, polygons: true };
var paintMode = false;
var sprayMode = false;
var featureInfoTracker = { addedIndex: 0, totalCount: 0, displayedCount: 0 };
let zoom = 2.7;
let targetZoom = 2.7;
function init() {
    canvas = document.createElement("canvas");
    exports.gl = canvas.getContext("webgl2");
    if (!exports.gl) {
        window.alert("this browser does not support webgl 2, try firefox");
    }
    document.body.appendChild(canvas);
    sizeCanvas();
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mouse.startx = canvas.width / 2;
    mouse.starty = canvas.height / 2;
    tileMap = mapLoad_1.loadMapChuncksBinary("./binaryChuncks");
    featureMap = new map_1.mapLayer([], []);
    renderer = new renderer_1.mapRenderer(exports.gl);
    tileMap.setStyleTableFromArray("polygon", [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.8, 0.8, 0.8, 1, 0.9, 0.9, 0.9, 1], [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.5, 0.5, 1]);
    tileMap.setStyleTableFromArray("outline", [0, 0, 0.6, 2, 0, 1, 0, 3, 0, 0, 1, 8, 0, 0, 0.6, 2, 0, 0, 0.6, 2], [0.4, 0.2, 0.0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    featureMap.setStyleTableFromArray("polygon", [1, 0.5, 0.5, 1, 0, 0, 1, 1], [1, 0.5, 0.5, 0, 1, 1, 1, 0]);
    featureMap.setStyleTableFromArray("outline", [1, 0, 0, 4, 0, 1, 0, 4], [1, 0, 0, 0, 1, 1, 1, 0]);
    window.onload = loop;
}
function invalidate() {
    invalidated = true;
}
exports.invalidate = invalidate;
function incrementFeatureNumberDisplay(featureNumberDelta) {
    featureInfoTracker.totalCount += featureNumberDelta;
}
exports.incrementFeatureNumberDisplay = incrementFeatureNumberDisplay;
function setHoveredElement(id) {
    document.getElementById("HoveredElement").innerHTML = id;
}
exports.setHoveredElement = setHoveredElement;
function sizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    camera_1.camera.setAespectRatio(canvas.width, canvas.height);
    exports.gl.viewport(0, 0, canvas.width, canvas.height);
    invalidate();
}
let lastState = {};
function manageSidebar() {
    if (featureInfoTracker.displayedCount != featureInfoTracker.totalCount) {
        document.getElementById("TileNumber").innerHTML = featureInfoTracker.totalCount;
        featureInfoTracker.displayedCount = featureInfoTracker.totalCount;
    }
    let state = {};
    let lower = document.getElementById("lower").value;
    let upper = document.getElementById("upper").value;
    let lowerBound = state.lower = Math.exp(parseFloat(lower));
    let upperBound = state.upper = Math.exp(parseFloat(upper));
    renderer.setTransitionBoundry(lowerBound, upperBound);
    document.getElementById("ZoomLevel").innerHTML = Math.log(cam.scaleX).toFixed(1);
    state.lines = drawParams.lines = document.getElementById("lines").checked;
    state.polygons = drawParams.polygons = document.getElementById("polygons").checked;
    state.feature = drawParams.feature = document.getElementById("feature").checked;
    state.tile = drawParams.tile = document.getElementById("tile").checked;
    paintMode = document.getElementById("paint").checked;
    sprayMode = document.getElementById("spray").checked;
    if (lastState.lower != state.lower || lastState.upper != state.upper || lastState.lines != state.lines || lastState.polygons != state.polygons || lastState.tile != state.tile || lastState.feature != state.feature) {
        lastState = state;
        invalidate();
    }
}
function loop() {
    manageSidebar();
    let deltaZoom = (targetZoom - zoom) * 0.1;
    zoom = zoom + deltaZoom;
    let center = camera_1.camera.toWorldSpace(mouse.x, mouse.y, cam, canvas);
    center.x = -center.x;
    center.y = -center.y;
    cam.x = cam.x * (1 - deltaZoom / zoom) + center.x * (deltaZoom / zoom);
    cam.y = cam.y * (1 - deltaZoom / zoom) + center.y * (deltaZoom / zoom);
    if (Math.abs(zoom - targetZoom) > 0.01) {
        invalidate();
    }
    cam.scaleX = zoom;
    cam.scaleY = zoom;
    if (invalidated) {
        renderer.clear();
        if (drawParams.tile)
            renderer.renderMap(tileMap, camera_1.camera.getView(cam.x, cam.y, cam.scaleY, cam.scaleY), drawParams.polygons, drawParams.lines);
        if (drawParams.feature)
            renderer.renderMap(featureMap, camera_1.camera.getView(cam.x, cam.y, cam.scaleX, cam.scaleY), drawParams.polygons, drawParams.lines);
        invalidated = false;
    }
    requestAnimationFrame(loop);
}
function sprayFeatures(x, y, radius, scale, count = 1) {
    for (let i = 0; i < count; i++) {
        let featureOutline = new Float32Array([0, 0, 0.5, 1, 1, 0]);
        let theta = Math.random() * Math.PI * 2;
        let offset = Math.random() * radius;
        for (let i = 0; i < featureOutline.length; i += 2) {
            featureOutline[i] = featureOutline[i] * scale + x + Math.cos(theta) * offset;
            featureOutline[i + 1] = featureOutline[i + 1] * scale + y + Math.sin(theta) * offset;
        }
        let subTile = tileMap.select(x + Math.cos(theta) * offset, y + Math.sin(theta) * offset);
        if (subTile) {
            tileMap.setStyle(subTile, 3);
        }
        featureMap.addFeature(featureOutline, "new feature " + featureInfoTracker.addedIndex++);
    }
}
init();
window.addEventListener("resize", sizeCanvas);
canvas.addEventListener("wheel", mouse => {
    targetZoom *= Math.pow(1.01, -mouse.deltaY);
    invalidate();
    window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
});
canvas.addEventListener("pointerdown", pointer => {
    if (pointer.button === 0) {
        mouse.left = true;
        mouse.x = pointer.offsetX;
        mouse.y = pointer.offsetY;
        mouse.startx = pointer.offsetX;
        mouse.starty = pointer.offsetY;
        baseCam.x = cam.x;
        baseCam.y = cam.y;
        cam.x = baseCam.x + (pointer.offsetX - mouse.startx) * 2 / 1000 / cam.scaleX;
        cam.y = baseCam.y - (pointer.offsetY - mouse.starty) * 2 / 1000 / cam.scaleY;
    }
    else if (pointer.button === 2) {
        mouse.right = true;
        let start = performance.now();
        let adjustedPointer = camera_1.camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        let featureSelection = featureMap.select(adjustedPointer.x, adjustedPointer.y);
        if (featureSelection) {
            featureMap.setStyle(featureSelection, 1);
        }
        else {
            tileMap.setStyle(tileMap.select(adjustedPointer.x, adjustedPointer.y), 2);
        }
        console.log(`selecting and styling 1 feature took ${performance.now() - start} ms`);
        invalidate();
    }
    else {
        let start = performance.now();
        let adjustedPointer = camera_1.camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
        tileMap.remove(adjustedPointer.x, adjustedPointer.y);
        console.log(`selecting and removing 1 feature took ${performance.now() - start} ms`);
        invalidate();
    }
});
canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
canvas.addEventListener("pointerup", pointer => {
    if (pointer.button === 0) {
        mouse.left = false;
        baseCam = { x: cam.x, y: cam.y };
        window.sessionStorage.setItem("VIEW", JSON.stringify(cam));
    }
    if (pointer.button === 2) {
        mouse.right = false;
    }
});
canvas.addEventListener("pointermove", pointer => {
    mouse.x = pointer.offsetX;
    mouse.y = pointer.offsetY;
    if (mouse.left) {
        cam.x = baseCam.x + (pointer.offsetX - mouse.startx) * 2 / 1000 / cam.scaleY;
        cam.y = baseCam.y - (pointer.offsetY - mouse.starty) * 2 / 1000 / cam.scaleX;
        invalidate();
    }
    let adjustedPointer = camera_1.camera.toWorldSpace(pointer.x, pointer.y, cam, canvas);
    if (paintMode) {
        let time1 = performance.now();
        let selection = tileMap.selectRectangle(new kdTree_1.boundingBox(adjustedPointer.x - 0.05, adjustedPointer.y - 0.05, adjustedPointer.x + 0.05, adjustedPointer.y + 0.05));
        selection.forEach(ele => {
            tileMap.setStyle(ele, 2);
        });
        console.log(`Selecting ${selection.length} elements took ${performance.now() - time1} miliseconds`);
        invalidate();
    }
    if (sprayMode) {
        sprayFeatures(adjustedPointer.x, adjustedPointer.y, 0.01, 0.001 * (Math.random() + 0.1), 1);
        invalidate();
    }
    let selected = featureMap.select(adjustedPointer.x, adjustedPointer.y);
    if (selected) {
        setHoveredElement(selected.id);
    }
    else {
        selected = tileMap.select(adjustedPointer.x, adjustedPointer.y);
        if (selected) {
            setHoveredElement(selected.id);
        }
        else {
            setHoveredElement("none");
        }
    }
});
