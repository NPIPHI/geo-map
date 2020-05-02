"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const point_in_polygon_1 = __importDefault(require("point-in-polygon"));
class boundingBox {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
    static fromStrip(points) {
        let x1;
        let x2;
        let y1;
        let y2;
        x1 = x2 = points[0];
        y1 = y2 = points[1];
        for (let i = 0; i < points.length; i += 2) {
            x1 = Math.min(x1, points[i]);
            x2 = Math.max(x2, points[i]);
            y1 = Math.min(y1, points[i + 1]);
            y2 = Math.max(y2, points[i + 1]);
        }
        return new boundingBox(x1, y1, x2, y2);
    }
    contains(x, y) {
        return x > this.x1 && x < this.x2 && y > this.y1 && y < this.y2;
    }
    intesects(bBox) {
        return bBox.x1 <= this.x2 && this.x1 <= bBox.x2 && bBox.y1 <= this.y2 && this.y1 <= bBox.y2;
    }
}
exports.boundingBox = boundingBox;
class KDHeep {
    constructor(elements, bBox, depth = 1) {
    }
}
class KDTree {
    constructor(elements, bBox, recursiveDepth = 10) {
        this.topNode = new KDNode(elements, bBox, recursiveDepth, true);
        this.outsideElements = [];
    }
    static async buildAsync(elements, bBox, recursiveDepth = 10) {
        return new Promise((resolve, reject) => {
            let tree = new KDTree(elements, bBox, recursiveDepth);
            resolve(tree);
        });
    }
    find(x, y) {
        let returnList = [];
        if (this.topNode.bBox.contains(x, y)) {
            this.topNode.find(x, y, returnList);
        }
        else {
            return this.outsideElements.filter(ele => ele.bBox.contains(x, y));
        }
        return returnList;
    }
    findFirst(x, y) {
        if (this.topNode.bBox.contains(x, y)) {
            return this.topNode.findFirst(x, y);
        }
        else {
            return this.outsideElements.find(ele => ele.bBox.contains(x, y));
        }
    }
    findSelection(bBox) {
        let returnList = [];
        if (this.topNode.bBox.intesects(bBox)) {
            this.topNode.findSelection(bBox, returnList);
        }
        else {
            return this.outsideElements.filter(ele => ele.bBox.intesects(bBox));
        }
        return returnList;
    }
    popFirst(x, y) {
        if (this.topNode.bBox.contains(x, y)) {
            return this.topNode.popFirst(x, y);
        }
        else {
            for (let i = 0; i < this.outsideElements.length; i++) {
                if (this.outsideElements[i].bBox.contains(x, y)) {
                    return this.outsideElements.splice(i, 1)[0];
                }
            }
        }
        return undefined;
    }
    insert(element) {
        if (this.topNode.bBox.intesects(element.bBox)) {
            this.topNode.insert(element);
        }
        else {
            this.outsideElements.push(element);
        }
    }
}
exports.KDTree = KDTree;
class KDNode {
    constructor(elements, bBox, recursiveDepth, splitDirection) {
        this.bBox = bBox;
        if (recursiveDepth !== 0) {
            let node1Box;
            let node2Box;
            let node1Elements = [];
            let node2Elements = [];
            this.elements = [];
            if (splitDirection) {
                node1Box = new boundingBox(bBox.x1, bBox.y1, (bBox.x2 + bBox.x1) / 2, bBox.y2);
                node2Box = new boundingBox((bBox.x2 + bBox.x1) / 2, bBox.y1, bBox.x2, bBox.y2);
            }
            else {
                node1Box = new boundingBox(bBox.x1, bBox.y1, bBox.x2, (bBox.y2 + bBox.y1) / 2);
                node2Box = new boundingBox(bBox.x1, (bBox.y2 + bBox.y1) / 2, bBox.x2, bBox.y2);
            }
            elements.forEach(ele => {
                let inNode1 = ele.bBox.intesects(node1Box);
                let inNode2 = ele.bBox.intesects(node2Box);
                if (inNode1 && inNode2) {
                    this.elements.push(ele);
                }
                else if (inNode1) {
                    node1Elements.push(ele);
                }
                else if (inNode2) {
                    node2Elements.push(ele);
                }
                else {
                    throw ("element was not in bounding box");
                }
            });
            this.node1 = new KDNode(node1Elements, node1Box, recursiveDepth - 1, !splitDirection);
            this.node2 = new KDNode(node2Elements, node2Box, recursiveDepth - 1, !splitDirection);
        }
        else {
            this.elements = elements;
        }
    }
    insert(element) {
        let inNode1 = !!this.node1 && element.bBox.intesects(this.node1.bBox);
        let inNode2 = !!this.node2 && element.bBox.intesects(this.node2.bBox);
        if (inNode1 && inNode2) {
            this.elements.push(element);
        }
        else if (inNode1) {
            this.node1.insert(element);
        }
        else if (inNode2) {
            this.node2.insert(element);
        }
        else {
            this.elements.push(element);
        }
    }
    find(x, y, returnList) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.contains(x, y)) {
                if (this.inShape(this.elements[i].shape, x, y)) {
                    returnList.push(this.elements[i]);
                }
            }
        }
        if (this.node1 && this.node1.bBox.contains(x, y)) {
            this.node1.find(x, y, returnList);
        }
        if (this.node2 && this.node2.bBox.contains(x, y)) {
            this.node2.find(x, y, returnList);
        }
    }
    findFirst(x, y) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.contains(x, y)) {
                if (this.inShape(this.elements[i].shape, x, y)) {
                    return this.elements[i];
                }
            }
        }
        let found;
        if (this.node1 && this.node1.bBox.contains(x, y)) {
            found = this.node1.findFirst(x, y);
            if (found)
                return found;
        }
        if (this.node2 && this.node2.bBox.contains(x, y)) {
            found = this.node2.findFirst(x, y);
            if (found)
                return found;
        }
        return null;
    }
    findSelection(bBox, returnList) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.intesects(bBox)) {
                returnList.push(this.elements[i]);
            }
        }
        if (this.node1 && this.node1.bBox.intesects(bBox)) {
            this.node1.findSelection(bBox, returnList);
        }
        if (this.node2 && this.node2.bBox.intesects(bBox)) {
            this.node2.findSelection(bBox, returnList);
        }
    }
    popFirst(x, y) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].bBox.contains(x, y)) {
                if (this.inShape(this.elements[i].shape, x, y)) {
                    return this.elements.splice(i, 1)[0];
                }
            }
        }
        if (this.node1 && this.node1.bBox.contains(x, y)) {
            return this.node1.popFirst(x, y);
        }
        if (this.node2 && this.node2.bBox.contains(x, y)) {
            return this.node2.popFirst(x, y);
        }
    }
    inShape(shape, x, y) {
        return point_in_polygon_1.default([x, y], this.asPointArray(shape));
    }
    asPointArray(shape) {
        let ret = [];
        for (let i = 0; i < shape.length; i += 2) {
            ret.push([shape[i], shape[i + 1]]);
        }
        return ret;
    }
}
