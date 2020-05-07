import pointInPolygon from "point-in-polygon"

export interface spatialElement {
    bBox: boundingBox;
    shape: Float32Array;
    id: string;
}

export class boundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
    static fromStrip(points: ArrayLike<number>): boundingBox {
        let x1: number;
        let x2: number;
        let y1: number;
        let y2: number;
        x1 = x2 = points[0];
        y1 = y2 = points[1];
        for (let i = 0; i < points.length; i += 2) {
            x1 = Math.min(x1, points[i])
            x2 = Math.max(x2, points[i])
            y1 = Math.min(y1, points[i + 1])
            y2 = Math.max(y2, points[i + 1])
        }
        return new boundingBox(x1, y1, x2, y2);
    }
    containsPoint(x: number, y: number): boolean {
        return x > this.x1 && x < this.x2 && y > this.y1 && y < this.y2;
    }
    containsBox(bBox: boundingBox) {
        return this.x1 < bBox.x1 && this.x2 > bBox.x2 && this.y1 < bBox.y1 && this.y2 > bBox.y2;
    }
    intesects(bBox: boundingBox): boolean {
        return bBox.x1 <= this.x2 && this.x1 <= bBox.x2 && bBox.y1 <= this.y2 && this.y1 <= bBox.y2;
    }
}

export class BinarySpaceTree<T extends spatialElement> {
    topNode: BinarySpaceNode<T>;
    outsideElements: T[];
    constructor(bBox: boundingBox, recursiveDepth: number = 10) {
        this.topNode = new BinarySpaceNode([], bBox, recursiveDepth, true);
        this.outsideElements = [];
    }
    find(x: number, y: number): T[] {
        let returnList: T[] = []
        if(this.topNode.bBox.containsPoint(x, y)){
            this.topNode.find(x, y, returnList);
        } else {
            return this.outsideElements.filter(ele=>ele.bBox.containsPoint(x, y))
        }
        return returnList;
    }
    findID(id: string): T {
        let feature = this.topNode.findID(id);
        if(feature){
            return feature;
        } else {
            this.outsideElements.find(ele => ele.id = id);
        }
    }
    findFirst(x: number, y: number): T {
        if(this.topNode.bBox.containsPoint(x, y)){
            return this.topNode.findFirst(x, y);
        } else {
            return this.outsideElements.find(ele=>ele.bBox.containsPoint(x, y));
        }
    }
    findSelection(bBox: boundingBox): T[] {
        let returnList: T[] = []
        this.topNode.findSelection(bBox, returnList);
        if(!this.topNode.bBox.containsBox(bBox)){
            this.outsideElements.forEach(
                ele=>{
                    if(ele.bBox.intesects(bBox)) returnList.push(ele)
                })
        }
        return returnList;
    }
    popFirst(x: number, y: number): T {
        if(this.topNode.bBox.containsPoint(x, y)){
            return this.topNode.popFirst(x, y);
        } else {
            for(let i = 0; i < this.outsideElements.length; i++){
                if(this.outsideElements[i].bBox.containsPoint(x, y)){
                    return this.outsideElements.splice(i, 1)[0];
                }
            }
        }
        return undefined;
    }
    remove(element: T){
        if(!this.topNode.remove(element)){
            let index = this.outsideElements.indexOf(element);
            if(index > -1){
                this.outsideElements.splice(index, 1);
            } else {
                throw("Feature not in tree");
            }
        }
    }
    insert(element: T){
        if(this.topNode.bBox.intesects(element.bBox)){
            this.topNode.insert(element);
        } else {
            this.outsideElements.push(element);
        }
    }
}

class BinarySpaceNode<T extends spatialElement> {
    node1: BinarySpaceNode<T>;
    node2: BinarySpaceNode<T>;
    bBox: boundingBox;
    elements: T[];
    constructor(elements: T[], bBox: boundingBox, recursiveDepth: number, splitDirection: boolean) {
        this.bBox = bBox;
        if (recursiveDepth !== 0) {
            let node1Box: boundingBox;
            let node2Box: boundingBox;
            let node1Elements: T[] = [];
            let node2Elements: T[] = [];
            this.elements = [];
            if (splitDirection) {
                node1Box = new boundingBox(bBox.x1, bBox.y1, (bBox.x2 + bBox.x1) / 2, bBox.y2);
                node2Box = new boundingBox((bBox.x2 + bBox.x1) / 2, bBox.y1, bBox.x2, bBox.y2);
            } else {
                node1Box = new boundingBox(bBox.x1, bBox.y1, bBox.x2, (bBox.y2 + bBox.y1) / 2);
                node2Box = new boundingBox(bBox.x1, (bBox.y2 + bBox.y1) / 2, bBox.x2, bBox.y2);
            }
            elements.forEach(ele => {
                let inNode1 = ele.bBox.intesects(node1Box);
                let inNode2 = ele.bBox.intesects(node2Box);
                if (inNode1 && inNode2) {
                    this.elements.push(ele);
                } else if (inNode1) {
                    node1Elements.push(ele);
                } else if (inNode2) {
                    node2Elements.push(ele);
                } else {
                    throw ("element was not in bounding box")
                }
            })
            this.node1 = new BinarySpaceNode(node1Elements, node1Box, recursiveDepth - 1, !splitDirection);
            this.node2 = new BinarySpaceNode(node2Elements, node2Box, recursiveDepth - 1, !splitDirection);
        } else {
            this.elements = elements;
        }
    }
    insert(element: T) {
        let inNode1 = !!this.node1 && element.bBox.intesects(this.node1.bBox);
        let inNode2 = !!this.node2 && element.bBox.intesects(this.node2.bBox);
        if (inNode1 && inNode2) {
            this.elements.push(element);
        } else if (inNode1) {
            this.node1.insert(element);
        } else if (inNode2) {
            this.node2.insert(element);
        } else {
            this.elements.push(element); //this leaves are undefined
        }
    }
    find(x: number, y: number, returnList: T[]) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.containsPoint(x, y)) {
                if (this.inShape(this.elements[i].shape, x, y)) {
                    returnList.push(this.elements[i]);
                }
            }
        }
        if (this.node1 && this.node1.bBox.containsPoint(x, y)) {
            this.node1.find(x, y, returnList)
        }
        if (this.node2 && this.node2.bBox.containsPoint(x, y)) {
            this.node2.find(x, y, returnList)
        }
    }
    findID(id: string): T {
        let ret = this.elements.find(ele=>ele.id = id);
        if(ret){
            return ret;
        } else {
            ret = this.node1.findID(id);
            if(ret){
                return ret;
            } else {
                return this.node2.findID(id);
            }
        }
    }
    findFirst(x: number, y: number): T{
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.containsPoint(x, y)) {
                if (this.inShape(this.elements[i].shape, x, y)) {
                    return this.elements[i];
                }
            }
        }
        let found: T;
        if (this.node1 && this.node1.bBox.containsPoint(x, y)) {
            found = this.node1.findFirst(x, y)
            if(found) return found;
        }
        if (this.node2 && this.node2.bBox.containsPoint(x, y)) {
            found = this.node2.findFirst(x, y)
            if(found) return found;
        }
        return undefined;
    }
    findSelection(bBox: boundingBox, returnList: T[]){
        this.elements.forEach(ele=>{
            if(ele.bBox.intesects(bBox)){
                returnList.push(ele);
            }
        });
        if (this.node1 && this.node1.bBox.intesects(bBox)) {
            this.node1.findSelection(bBox, returnList)
        }
        if (this.node2 && this.node2.bBox.intesects(bBox)) {
            this.node2.findSelection(bBox, returnList)
        }
    }
    remove(element: T): boolean{
        let inNode1 = !!this.node1 && element.bBox.intesects(this.node1.bBox);
        let inNode2 = !!this.node2 && element.bBox.intesects(this.node2.bBox);
        if (inNode1 && !inNode2) {
            return this.node1.remove(element);
        } else if (inNode2) {
            return this.node2.remove(element);
        }
        for(let i = 0; i < this.elements.length; i++){
            if(this.elements[i] === element){
                this.elements.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    popFirst(x: number, y: number): T | undefined {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.containsPoint(x, y)) {
                if(this.inShape(this.elements[i].shape, x, y)){
                    return this.elements.splice(i, 1)[0];
                }
            }
        }
        if (this.node1 && this.node1.bBox.containsPoint(x, y)) {
            return this.node1.popFirst(x, y)
        }
        if (this.node2 && this.node2.bBox.containsPoint(x, y)) {
            return this.node2.popFirst(x, y)
        }
    }
    private inShape(shape: Float32Array, x: number, y: number): boolean{
        return pointInPolygon([x, y], this.asPointArray(shape))
    }
    private asPointArray(shape: Float32Array): number[][] {
        let ret: number[][] = [];
        for (let i = 0; i < shape.length; i += 2) {
            ret.push([shape[i], shape[i + 1]]);
        }
        return ret;
    }
}