"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class inputHandler {
    constructor(canvas, camera, invalidateCallback) {
        this.minimumHoverTime = 400;
        this.smoothTransitionFactor = 1;
        this.canvas = canvas;
        this.camera = camera;
        this.mouse = { x: 0, y: 0, left: false, right: false, middle: false };
        this.targets = [];
        this.invalidate = invalidateCallback;
        this.resizeCanvas();
        canvas.addEventListener("pointerdown", (pointer) => this.mousedown(pointer.offsetX, pointer.offsetY, pointer.button));
        canvas.addEventListener("pointermove", (pointer) => this.mousemove(pointer.offsetX, pointer.offsetY));
        canvas.addEventListener("pointerup", (pointer) => this.mouseup(pointer.offsetX, pointer.offsetY, pointer.button));
        canvas.addEventListener("wheel", (pointer) => this.mousewheel(pointer.deltaY));
        canvas.addEventListener("touchstart", event => this.touchstart(event));
        canvas.addEventListener("touchmove", event => this.touchmove(event));
        canvas.addEventListener("touchend", event => this.touchend(event));
        window.addEventListener("resize", event => this.resizeCanvas());
    }
    pollEvents() {
        if (this.mouse.left && this.lastMouseAction + this.minimumHoverTime < performance.now()) {
            this.lastMouseAction = Infinity;
            this.callListeners("hover", this.camera.toWorldSpace(this.mouse.x, this.mouse.y));
        }
    }
    resizeCanvas() {
        let canvasRect = this.canvas.getBoundingClientRect();
        this.canvas.width = canvasRect.width;
        this.canvas.height = canvasRect.height;
        this.canvasCorner = { x: canvasRect.left, y: canvasRect.top };
        this.camera.setAespectRatio(this.canvas.width, this.canvas.height);
        index_1.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.invalidateCanvas();
    }
    invalidateCanvas() {
        this.invalidate();
    }
    touchstart(event) {
        this.updateTouches(event);
        if (!this.touch1) {
            this.touch1 = this.newTouch;
            this.mouse.x = this.touch1.clientX - this.canvas.getBoundingClientRect().x;
            this.mouse.y = this.touch1.clientY - this.canvas.getBoundingClientRect().x;
        }
        else if (!this.touch2) {
            this.touch2 = this.newTouch;
            this.camera.twoPointDown(this.offsetPoint(this.touch1), this.offsetPoint(this.touch2));
            this.invalidateCanvas();
        }
    }
    offsetPoint(touch) {
        return { x: touch.clientX - this.canvasCorner.x, y: touch.clientY - this.canvasCorner.y };
    }
    touchmove(event) {
        this.updateTouches(event);
        event.preventDefault();
        if (this.touch1 && !this.touch2) {
            let correctedPoint = this.offsetPoint(this.touch1);
            this.mousemove(correctedPoint.x, correctedPoint.y);
        }
        if (this.touch1 && this.touch2) {
            this.camera.twoPointMove(this.offsetPoint(this.touch1), this.offsetPoint(this.touch2));
            this.invalidateCanvas();
        }
    }
    touchend(event) {
        this.updateTouches(event);
        if (this.touch2 && !this.touch1) {
            this.touch2 = this.touch1;
        }
    }
    updateTouches(event) {
        let t1ID = null;
        let t2ID = null;
        if (this.touch1) {
            t1ID = this.touch1.identifier;
        }
        if (this.touch2) {
            t2ID = this.touch2.identifier;
        }
        this.touch1 = undefined;
        this.touch2 = undefined;
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            if (touch.identifier == t1ID) {
                this.touch1 = touch;
            }
            else if (touch.identifier == t2ID) {
                this.touch2 = touch;
            }
            else {
                this.newTouch = touch;
            }
        }
    }
    mousedown(x, y, button) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.lastMouseAction = performance.now();
        if (button === 0) {
            this.camera.onePointDown(x, y);
            this.mouse.left = true;
            let worldPoint = this.camera.toWorldSpace(x, y);
            this.callListeners("pointerdown", worldPoint);
        }
    }
    mousemove(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.lastMouseAction = performance.now();
        if (this.mouse.left) {
            this.camera.onePointMove(x, y);
            this.invalidateCanvas();
        }
    }
    mouseup(x, y, button) {
        this.lastMouseAction = performance.now();
        if (button === 0) {
            this.mouse.left = false;
            this.callListeners("pointerup", this.camera.toWorldSpace(x, y));
        }
    }
    mousewheel(scroll) {
        this.camera.zoom(Math.pow(1.01, -scroll), this.mouse.x, this.mouse.y);
        this.invalidateCanvas();
    }
    callListeners(type, point) {
        this.targets.forEach(target => target.callEventListener(type, point));
    }
}
exports.inputHandler = inputHandler;
