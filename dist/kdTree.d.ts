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
export declare class BinarySpaceTree<T extends spatialElement> {
    topNode: BinarySpaceNode<T>;
    outsideElements: T[];
    constructor(bBox: boundingBox, recursiveDepth?: number);
    find(x: number, y: number): T[];
    findFirst(x: number, y: number): T;
    findSelection(bBox: boundingBox): T[];
    popFirst(x: number, y: number): T;
    insert(element: T): void;
}
declare class BinarySpaceNode<T extends spatialElement> {
    node1: BinarySpaceNode<T>;
    node2: BinarySpaceNode<T>;
    bBox: boundingBox;
    elements: T[];
    constructor(elements: T[], bBox: boundingBox, recursiveDepth: number, splitDirection: boolean);
    insert(element: T): void;
    find(x: number, y: number, returnList: T[]): void;
    findFirst(x: number, y: number): T;
    findSelection(bBox: boundingBox, returnList: T[]): void;
    popFirst(x: number, y: number): T | undefined;
    private inShape;
    private asPointArray;
}
export {};
