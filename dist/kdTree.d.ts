export interface spatialElement {
    bBox: boundingBox;
    shape: Float32Array;
}
export declare class boundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
    static fromStrip(points: ArrayLike<number>): boundingBox;
    contains(x: number, y: number): boolean;
    intesects(bBox: boundingBox): boolean;
}
export declare class KDHeep {
    constructor(elements: spatialElement[], bBox: boundingBox, depth?: number);
}
export declare class KDTree {
    topNode: KDNode;
    constructor(elements: spatialElement[], bBox: boundingBox, recursiveDepth?: number);
    static buildAsync(elements: spatialElement[], bBox: boundingBox, recursiveDepth?: number): Promise<KDTree>;
    find(x: number, y: number): spatialElement[];
    popFirst(x: number, y: number): spatialElement;
    insert(element: spatialElement): void;
}
declare class KDNode {
    node1: KDNode;
    node2: KDNode;
    bBox: boundingBox;
    elements: spatialElement[];
    constructor(elements: spatialElement[], bBox: boundingBox, recursiveDepth: number, splitDirection: boolean);
    insert(element: spatialElement): void;
    find(x: number, y: number, returnList: spatialElement[]): void;
    popFirst(x: number, y: number): spatialElement | undefined;
    private inShape;
    private asPointArray;
}
export {};
