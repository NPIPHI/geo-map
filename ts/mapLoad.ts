import * as mapData from "../mapData/output.json"

export async function loadMap(): Promise<Float32Array[]> {
    let file = await fetch("../mapData/output.buf");
    let buffer = await file.arrayBuffer()
    let pointArray = new Float32Array(buffer);
    let pointPaths: Float32Array[] = [];

    mapData.shapes.forEach(shape => {
        pointPaths.push(pointArray.slice(shape[1] as number, (shape[1] as number) + (shape[2] as number) * 2 - 2))//dont include the first point twice
    });
    return pointPaths.slice(0, 100);
}