import { mapRenderer } from "./renderer"
import { camera } from "./camera"
import { loadMapChuncksBinary, loadMapBinary } from "./mapLoad";
import { mapLayer } from "./map"
import { boundingBox } from "./kdTree";
import { bufferConstructor } from "./bufferConstructor";
import { GeoMap } from "./index"

// var renderer: mapRenderer;
// var tileMap: mapLayer;
// var featureMap: mapLayer;
// var cam: camera;

// var mouse = {x: 0, y: 0, left: false, right: false }
// var invalidated = false;
// var drawParams = { tile: true, feature: true, lines: true, polygons: true }
// var paintMode = false;
// var sprayMode = false;
// var featureInfoTracker = {addedIndex: 0, totalCount: 0, displayedCount: 0}
// var sideBarElements: any;

// let zoom = 1;
// let targetZoom = 1;

const bbox = { x1: 6429499, y1: 1797629, x2: 6446651, y2: 1805369 }
const squareBbox = { x1: 6429499, y1: 1792923, x2: 6446651, y2: 1810075 }

function init() {
    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    let map = new GeoMap(canvas, bbox);
    let tileMap = map.createLayer("tile");
    let featureMap = map.createLayer("feature");
    map.addLayer(tileMap);
    map.addLayer(featureMap);
    map.loadDataChuncks(tileMap, "./binaryChuncks", "binary")
    tileMap.setStyleTableFromArray("polygon", [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.8, 0.8, 0.8, 1, 0.9, 0.9, 0.9, 1], [0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.9, 0.5, 1, 0.9, 0.5, 0.5, 1]);
    tileMap.setStyleTableFromArray("outline", [0, 0, 0.6, 2, 0, 1, 0, 3, 0, 0, 1, 8, 0, 0, 0.6, 2, 0, 0, 0.6, 2], [0.4, 0.2, 0.0, 0, 0, 1, 1, 0, 1, 0, 1, 0,  1, 0, 0, 0, 1, 0, 0, 0]);
    featureMap.setStyleTableFromArray("polygon", [1, 0.5, 0.5, 1, 0, 0, 1, 1], [1, 0.5, 0.5, 0, 1, 1, 1, 0])
    featureMap.setStyleTableFromArray("outline", [1, 0, 0, 4, 0, 1, 0, 4], [1, 0, 0, 0, 1, 1, 1, 0])
    //window.addEventListener('load', attachSidebar);
    //window.addEventListener('load', loop);
}

init();

// export function invalidate() {
//     invalidated = true;
// }

// export function incrementFeatureNumberDisplay(featureNumberDelta: number) {
//     featureInfoTracker.totalCount += featureNumberDelta;
// }

// export function setHoveredElement(id: string) {
//     document.getElementById("HoveredElement").innerHTML = id;
// }

// // function sizeCanvas() {
// //     canvas.width = canvas.getBoundingClientRect().width;
// //     canvas.height = canvas.getBoundingClientRect().height;
// //     cam.setAespectRatio(canvas.width, canvas.height);
// //     gl.viewport(0, 0, canvas.width, canvas.height);
// //     invalidate();
// // }

// let lastState: any = {};
// function attachSidebar(){
//     sideBarElements = {};
//     sideBarElements.lower = document.getElementById("lower");
//     sideBarElements.upper = document.getElementById("upper");
//     sideBarElements.zoom = document.getElementById("ZoomLevel");
//     sideBarElements.lines = document.getElementById("lines");
//     sideBarElements.polygons = document.getElementById("polygons");
//     sideBarElements.feature = document.getElementById("feature");
//     sideBarElements.tile = document.getElementById("tile");
//     sideBarElements.paint = document.getElementById("paint");
//     sideBarElements.spray = document.getElementById("spray");
// }
// function manageSidebar() {
//     if(featureInfoTracker.displayedCount != featureInfoTracker.totalCount){
//         document.getElementById("TileNumber").innerHTML = featureInfoTracker.totalCount as any;
//         featureInfoTracker.displayedCount = featureInfoTracker.totalCount;
//     }
//     let state: any = {};
//     let lower = sideBarElements.lower.value;
//     let upper = sideBarElements.upper.value;
//     let lowerBound = state.lower = Math.exp(parseFloat(lower));
//     let upperBound = state.upper = Math.exp(parseFloat(upper));
//     renderer.setTransitionBoundry(lowerBound, upperBound);
//     sideBarElements.zoom.innerHTML = Math.log(cam.getZoom()).toFixed(1);
//     state.lines = drawParams.lines = sideBarElements.lines.checked;
//     state.polygons = drawParams.polygons = sideBarElements.polygons.checked;
//     state.feature = drawParams.feature = sideBarElements.feature.checked;
//     state.tile = drawParams.tile = sideBarElements.tile.checked;
//     paintMode = sideBarElements.paint.checked;
//     sprayMode = sideBarElements.spray.checked;
//     if (lastState.lower != state.lower || lastState.upper != state.upper || lastState.lines != state.lines || lastState.polygons != state.polygons || lastState.tile != state.tile || lastState.feature != state.feature) {
//         lastState = state;
//         invalidate();
//     }
// }

// function loop() {
//     manageSidebar();
//     let deltaZoom = Math.log(targetZoom/zoom) * 0.1;
//     zoom = zoom * Math.exp(deltaZoom);
//     if(Math.abs(deltaZoom) > 0.001){
//         cam.zoom(Math.exp(deltaZoom), mouse.x, mouse.y)
//         invalidate()
//     }
//     if(invalidated){
//         renderer.clear();
//         if(drawParams.tile) renderer.renderMap(tileMap, cam.view, drawParams.polygons, drawParams.lines);
//         if(drawParams.feature) renderer.renderMap(featureMap, cam.view, drawParams.polygons, drawParams.lines);
//         invalidated = false;
//     }
//     requestAnimationFrame(loop);
// }

// function sprayFeatures(x: number, y: number, radius: number, scale: number, count: number = 1){
//     for(let i = 0; i < count; i++){
//         let featureOutline = new Float64Array([0, 0, 0.5, 1, 1, 0])
//         let theta = Math.random() * Math.PI * 2;
//         let offset = Math.random() * radius;
//         for(let i = 0; i < featureOutline.length; i+=2){ 
//             featureOutline[i] = featureOutline[i] * scale + x + Math.cos(theta) * offset;
//             featureOutline[i+1] = featureOutline[i+1] * scale + y + Math.sin(theta) * offset;
//         }
//         let subTile = tileMap.selectByPoint(x + Math.cos(theta) * offset, y + Math.sin(theta) * offset)
//         if(subTile){
//             tileMap.setStyle(subTile, 3);
//         }
//         featureMap.addFeature(featureOutline, "new feature " + featureInfoTracker.addedIndex++);
//     }
// }

// function mouseMove(pointer: {x: number, y: number}){
//     mouse.x = pointer.x;
//     mouse.y = pointer.y;
//     if (mouse.left) {
//         cam.onePointMove(pointer.x, pointer.y);
//         invalidate();
//     }
//     let adjustedPointer = cam.toWorldSpace(pointer.x, pointer.y);
//     if (paintMode) {
//         let time1 = performance.now();
//         let selection = tileMap.selectByRectangle(new boundingBox(adjustedPointer.x - 500, adjustedPointer.y - 500, adjustedPointer.x + 500, adjustedPointer.y + 500));
//         selection.forEach(ele => {
//             tileMap.setStyle(ele, 2);
//         })
//         console.log(`Selecting ${selection.length} elements took ${performance.now() - time1} miliseconds`)
//         invalidate();
//     }

//     if (sprayMode) {
//         sprayFeatures(adjustedPointer.x, adjustedPointer.y, 100, 10 * (Math.random() + 0.1), 1);
//         invalidate();
//     }
//     let selected = featureMap.selectByPoint(adjustedPointer.x, adjustedPointer.y);
//     if (selected) {
//         setHoveredElement(selected.id);
//     } else {
//         selected = tileMap.selectByPoint(adjustedPointer.x, adjustedPointer.y)
//         if (selected) {
//             setHoveredElement(selected.id);
//         } else {
//             setHoveredElement("none");
//         }
//     }
// }

// function mouseDown(pointer: {x: number, y: number, button: number}){
//     if (pointer.button === 0) {
//         cam.onePointDown(pointer.x, pointer.y)
//         mouse.left = true;
//         mouse.x = pointer.x;
//         mouse.y = pointer.y;
//     } else if (pointer.button === 2) {
//         mouse.right = true;
//         let start = performance.now();
//         let adjustedPointer = cam.toWorldSpace(pointer.x, pointer.y);
//         let featureSelection = featureMap.selectByPoint(adjustedPointer.x, adjustedPointer.y);
//         if(featureSelection){
//             featureMap.setStyle(featureSelection, 1);
//         } else {
//             tileMap.setStyle(tileMap.selectByPoint(adjustedPointer.x, adjustedPointer.y), 2);
//         }
//         console.log(`selecting and styling 1 feature took ${performance.now()-start} ms`);
//         invalidate();
//     } else {
//         let start = performance.now()
//         let adjustedPointer = cam.toWorldSpace(pointer.x, pointer.y);
//         tileMap.popByPoint(adjustedPointer.x, adjustedPointer.y);
//         console.log(`selecting and removing 1 feature took ${performance.now()-start} ms`);
//         invalidate();
//     }
// }

// function mouseUp(pointer: {offsetX: number, offsetY: number, button: number}){
//     if (pointer.button === 0) {
//         mouse.left = false;
//     } 
//     if (pointer.button === 2) {
//         mouse.right = false;
//     }
// }

// function mouseScroll(mouse: {deltaY: number}){
//     targetZoom *= Math.pow(1.01, -mouse.deltaY);
//     invalidate();
// }

// // window.addEventListener("resize", sizeCanvas);

// canvas.addEventListener("wheel", mouseScroll)

// canvas.addEventListener("pointerdown", mouseDown)

// canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); return false })

// canvas.addEventListener("pointerup", mouseUp)

// canvas.addEventListener("pointermove", mouseMove)


// let touch1: Touch;
// let touch2: Touch;
// let newTouch: Touch;
// function updateTouches(event: TouchEvent){
//     let t1ID = null;
//     let t2ID = null;
//     if(touch1){
//         t1ID = touch1.identifier;
//     }
//     if(touch2){
//         t2ID = touch2.identifier;
//     }
//     touch1 = undefined;
//     touch2 = undefined;
//     for (let i = 0; i < event.touches.length; i++) {
//         const touch = event.touches[i];
//         if(touch.identifier == t1ID){
//             touch1 = touch;
//         } else if(touch.identifier == t2ID){
//             touch2 = touch;
//         } else {
//             newTouch = touch;
//         }
//     }
// }
// canvas.addEventListener("touchstart", event=>{
//     event.preventDefault();
//     updateTouches(event);
//     if(!touch1){
//         touch1 = newTouch;
//     } else if(!touch2){
//         touch2 = newTouch;
//         cam.twoPointDown({x: touch1.clientX, y: touch1.clientY}, {x: touch2.clientX, y: touch2.clientY})
//         invalidate();
//     }
// })
// canvas.addEventListener("touchmove", event=>{
//     updateTouches(event);
//     if(touch1 && touch2){
//         cam.twoPointMove({x: touch1.clientX, y: touch1.clientY}, {x: touch2.clientX, y: touch2.clientY})
//         invalidate();
//     }
//     if(touch1){

//     }
// })
// canvas.addEventListener("touchend", event=>{
//     updateTouches(event);
//     if(touch2 && !touch1){
//         touch2 = touch1;
//     }
// });