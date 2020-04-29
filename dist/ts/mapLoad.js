"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mapData = __importStar(require("../mapData/output.json"));
async function loadMap() {
    let file = await fetch("../mapData/output.buf");
    let buffer = await file.arrayBuffer();
    let pointArray = new Float32Array(buffer);
    let pointPaths = [];
    mapData.shapes.forEach(shape => {
        pointPaths.push(pointArray.slice(shape[1], shape[1] + shape[2] * 2 - 2));
    });
    return pointPaths;
}
exports.loadMap = loadMap;
