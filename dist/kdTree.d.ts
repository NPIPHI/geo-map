export interface spatialElement {
    bBox: boundingBox;
    shape: ArrayLike<number>;
    id: string;
}
export declare class boundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
    static fromStrip(points: ArrayLike<number>): boundingBox;
    containsPoint(x: number, y: number): boolean;
    containsBox(bBox: boundingBox): boolean;
    intesects(bBox: boundingBox): boolean;
}
export declare class BinarySpaceTree<T extends spatialElement> {
    topNode: BinarySpaceNode<T>;
    outsideElements: T[];
    constructor(bBox: boundingBox, recursiveDepth?: number);
    find(x: number, y: number): T[];
    findID(id: string): T;
    findFirst(x: number, y: number): T;
    findSelection(bBox: boundingBox): T[];
    popFirst(x: number, y: number): T;
    remove(element: T): void;
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
    findID(id: string): T;
    findFirst(x: number, y: number): T;
    findSelection(bBox: boundingBox, returnList: T[]): void;
    remove(element: T): boolean;
    popFirst(x: number, y: number): T | undefined;
    private inShape;
    private asPointArray;
}
export {};
