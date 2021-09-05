import * as Graph from './graph.js';
import * as GPU from '../gpu/gpu.js';
export class Box {
    constructor(x, y, maxInputs) {
        this.body = document.createElement("div");
        this.body.className = "box";
        this.inputs = [];
        this.outputs = [];
        this.maxInputs = maxInputs;
        this.updated = false;
        this.result = undefined;
        this.x = x;
        this.y = y;
        this.body.draggable = true;
        this.body.ondragstart = (ev) => {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            if (ev.ctrlKey) {
                dragged = new Line(this);
            }
            else {
                Graph.thrash.style.display = "unset";
            }
            let div = document.createElement("div");
            if (ev.dataTransfer != null) {
                ev.dataTransfer.setDragImage(div, 0, 0);
            }
        };
        this.body.ondrag = (ev) => {
            ev.stopPropagation();
            if (ev.x != 0 && ev.y != 0) {
                if (dragged == null) {
                    if (ev.pageX != ev.screenX) {
                        return;
                    }
                    this.moveTo(ev.x, ev.y);
                    for (let i = 0; i < this.outputs.length; i++) {
                        this.outputs[i].setStart(this.x, this.y);
                    }
                    for (let i = 0; i < this.inputs.length; i++) {
                        this.inputs[i].setEnd(this.x, this.y);
                    }
                }
                else {
                    let x = ev.x;
                    let y = ev.y;
                    dragged.setEnd(x, y);
                }
            }
        };
        this.body.ondragenter = (ev) => {
            ev.stopPropagation();
            setTimeout(() => {
                if (dragged != null) {
                    if (dragged.start != this) {
                        dragged.end = this;
                    }
                }
            }); //delay because enter of the child fires before the leave
        };
        this.body.ondragleave = (ev) => {
            ev.stopPropagation();
            if (dragged != null) {
                if (dragged.start != this) {
                    if (ev.screenX != 0 && ev.screenY != 0) {
                        dragged.end = undefined;
                    }
                }
            }
        };
        this.body.ondragend = async (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            if (dragged != null) {
                if (dragged.end != undefined) {
                    let start = dragged.start;
                    let end = dragged.end;
                    for (let i = 0; i < start.outputs.length; i++) {
                        if (start.outputs[i].end == end) {
                            dragged.delete();
                            start.outputs[i].delete();
                            return;
                        }
                    }
                    for (let i = 0; i < start.inputs.length; i++) {
                        if (start.inputs[i].start == end) {
                            start.inputs[i].delete();
                            break;
                        }
                    }
                    if (end.cycleCheck(start)) {
                        dragged.delete();
                        return;
                    }
                    start.outputs.push(dragged);
                    end.inputs.push(dragged);
                    dragged.setEnd(end.x, end.y);
                    if (end.inputs.length > end.maxInputs) {
                        end.inputs[0].delete();
                    }
                    end.recursiveReset();
                    GPU.Start();
                    await end.recursiveUpdate();
                    GPU.End();
                }
                else {
                    dragged.delete();
                }
                dragged = null;
            }
            else {
                Graph.thrash.style.display = "none";
                if (this.x * this.x + this.y * this.y < 100 * 100) {
                    this.delete();
                }
            }
        };
    }
    delete() {
        while (this.outputs.length > 0) {
            this.outputs[0].delete();
        }
        while (this.inputs.length > 0) {
            this.inputs[0].delete();
        }
        Graph.RemoveBox(this);
    }
    moveBy(x, y) {
        this.moveTo(this.x + x, this.y + y);
    }
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        let xOff = (x - Graph.area.offsetLeft) - this.body.offsetWidth / 2;
        let yOFF = (y - Graph.area.offsetTop) - this.body.offsetHeight / 2;
        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].setStart(x, y);
        }
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setEnd(x, y);
        }
        this.body.style.marginLeft = xOff.toString() + "px";
        this.body.style.marginTop = yOFF.toString() + "px";
    }
    cycleCheck(checked) {
        if (checked == this) {
            return true;
        }
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].end.cycleCheck(checked)) {
                return true;
            }
        }
        return false;
    }
    recursiveReset() {
        if (this.updated) {
            this.updated = false;
            for (let i = 0; i < this.outputs.length; i++) {
                this.outputs[i].end.recursiveReset();
            }
        }
    }
    async recursiveUpdate() {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].start.updated == false) {
                return;
            }
        }
        await this.update();
        this.updated = true;
        for (let i = 0; i < this.outputs.length; i++) {
            await this.outputs[i].end.recursiveUpdate();
        }
    }
}
let dragged = null;
export class Line {
    constructor(start) {
        this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.start = start;
        this.end = undefined;
        this.line.setAttribute("x1", start.x.toString());
        this.line.setAttribute("y1", start.y.toString());
        this.line.setAttribute("x2", start.x.toString());
        this.line.setAttribute("y2", start.y.toString());
        Graph.svg.append(this.line);
    }
    delete() {
        if (this.start != undefined) {
            let idx = this.start.outputs.indexOf(this);
            if (idx >= 0) {
                this.start.outputs.splice(idx, 1);
            }
        }
        if (this.end != undefined) {
            let idx = this.end.inputs.indexOf(this);
            if (idx >= 0) {
                this.end.inputs.splice(idx, 1);
            }
        }
        this.line.remove();
    }
    setStart(x, y) {
        this.line.setAttribute("x1", x.toString() + "px");
        this.line.setAttribute("y1", y.toString() + "px");
    }
    setEnd(x, y) {
        this.line.setAttribute("x2", x.toString() + "px");
        this.line.setAttribute("y2", y.toString() + "px");
    }
}
