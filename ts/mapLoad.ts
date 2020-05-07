import { mapLayer } from "./map"
import { invalidate } from "./main"

const bbox = { minx: 6429499.583465844, miny: 1797629.5004901737, maxx: 6446651.559660509, maxy: 1805369.9351405054 }
const resizeRatio = (bbox.maxx - bbox.minx) / (bbox.maxy - bbox.miny)
export async function loadMapBinary(): Promise<{ points: Float32Array[], ids: string[] }> {
    let file = await fetch("../mapData/output.buf");
    let buffer = await file.arrayBuffer()
    let mapData = await (await fetch("../mapData/output.json")).json();
    let pointArray = new Float32Array(buffer);
    let pointPaths: Float32Array[] = [];
    let idList: string[] = [];

    mapData.shapes.forEach((shape: (string | number)[]) => {
        pointPaths.push(pointArray.slice(shape[1] as number, (shape[1] as number) + (shape[2] as number) * 2 - 2))//dont include the first point twice
        idList.push(shape[0] as string);
    });
    return { points: pointPaths, ids: idList };
}

export function loadMapChuncksBinary(dir: string): mapLayer {
    let geoMap = new mapLayer();
    fetch(dir + "/meta.json").then(file => file.json().then(meta => {
        for (let i = 0; i < meta.count; i++) {
            addMapBinary(dir + "/" + i, geoMap);
        }
    }));
    return geoMap;
}

function addMapBinary(path: string, target: mapLayer) {
    return new Promise(resolve => {
        parseMapBinary(path).then(mapData => {
            let time1 = performance.now();
            target.addFeatures(mapData.points, mapData.ids);
            invalidate();
            console.log(`Adding ${mapData.points.length} features took ${performance.now() - time1} ms`)
            console.log(performance.now())
            resolve();
        });
    })
}

async function parseMapBinary(path: string): Promise<{points: Float32Array[], ids: string[]}> {
    return new Promise(resolve => {
        new binaryLoader(path, (points: Float32Array, indices: Int32Array, meta: string[]) => {
            let pointPaths: Float32Array[] = [];
            for (let i = 0; i < indices.length; i += 2) {
                let path = new Float32Array(indices[i + 1] * 2)
                for (let j = 0; j < indices[i + 1]; j++) {
                    path[j * 2] = points[indices[i] * 2 + j * 2] * resizeRatio;
                    path[j * 2 + 1] = points[indices[i] * 2 + j * 2 + 1];
                }
                pointPaths.push(path);
            }
            resolve({points: pointPaths, ids: meta});
        })
    })
}

class binaryLoader {
    points: Float32Array;
    indices: Int32Array;
    metadata: string[];
    resolve: (arg0: Float32Array, arg1: Int32Array, arg2: string[]) => void;
    constructor(path: string, resolve: (arg0: Float32Array, arg1: Int32Array, arg2: string[]) => void) {
        fetch(path + "points.bin").then(points => {
            points.arrayBuffer().then(buffer => {
                this.points = new Float32Array(new Int8Array(buffer).buffer);
                if (this.indices && this.metadata) {
                    this.resolve(this.points, this.indices, this.metadata)
                }
            })
        })
        fetch(path + "indices.bin").then(indices => {
            indices.arrayBuffer().then(buffer => {
                this.indices = new Int32Array(new Int8Array(buffer).buffer);
                if (this.points && this.metadata) {
                    this.resolve(this.points, this.indices, this.metadata)
                }
            })
        });
        fetch(path + "meta.json").then(fileString => {
            fileString.json().then(json => {
                this.metadata = json;
                if (this.points && this.indices) {
                    this.resolve(this.points, this.indices, this.metadata)
                }
            })
        });
        this.resolve = resolve;
    }
}

async function parseMapJson(path: string = "../mapData/slabs.json"): Promise<{ points: Float32Array[], ids: string[] }> {
    let rawData = await fetch(path);
    let jsonData = await rawData.json();

    let pointPaths: Float32Array[] = [];
    let idList: string[] = [];

    let xRescale = 1 / (bbox.maxx - bbox.minx);
    let yRescale = 1 / (bbox.maxx - bbox.minx);
    let xOffset = bbox.minx;
    let yOffset = bbox.miny;
    jsonData.forEach((slab: any) => {
        let points = slab.geometry.coordinates[0][0]
        let strip = new Float32Array(points.length * 2 - 2);
        for (let i = 0; i < points.length - 1; i++) {
            strip[i * 2] = (points[i][0] - xOffset) * xRescale;
            strip[i * 2 + 1] = (points[i][1] - yOffset) * yRescale;
        }
        idList.push(slab.properties.BRANCH_ID + "-" + slab.properties.SECTION_ID + "-" + slab.properties.postgis_id);
        pointPaths.push(strip);
    })
    return { points: pointPaths, ids: idList };
}

export function loadMapChuncks(dir: string): mapLayer {
    let geoMap = new mapLayer();
    fetch(dir + "/meta.json").then(file => file.json().then(meta => {
        for (let i = 0; i < meta.count; i++) {
            addMapJson(dir + "/" + i + ".json", geoMap);
        }
    }));
    return geoMap;
}

async function addMapJson(path: string, target: mapLayer): Promise<boolean> {
    return new Promise(resolve => {
        parseMapJson(path).then(mapData => {
            let time1 = performance.now();
            target.addFeatures(mapData.points, mapData.ids);
            invalidate();
            console.log(`Adding ${mapData.ids.length} features took ${performance.now() - time1} ms`)
            console.log(performance.now())
            resolve();
        });
    })
}