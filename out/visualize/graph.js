import * as GPU from '../gpu/gpu.js';
let field;
let trash;
let area;
let svg;
let modus;
let dragged;
let all;
export async function Setup() {
    svg = document.getElementById("svg");
    field = document.getElementById("field");
    trash = document.getElementById("trash");
    area = trash.parentElement;
    HideTrash();
    all = [];
    modus = "none";
    let start = { x: 0, y: 0 };
    area.onmousedown = (ev) => {
        modus = "all";
        start = { x: ev.clientX - field.offsetLeft, y: ev.clientY - field.offsetTop };
        ev.stopPropagation();
    };
    area.onmouseup = (ev) => {
        switch (modus) {
            case "line":
                let line = dragged;
                let start = line.start;
                let end = line.end;
                if (end != undefined) {
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
                    start.outputs.push(line);
                    end.inputs.push(line);
                    line.setEnd(end.x, end.y);
                    if (end.inputs.length > end.maxInputs) {
                        end.inputs[0].delete();
                    }
                    end.recursiveReset();
                    setTimeout(async () => {
                        GPU.Start();
                        await end.recursiveUpdate();
                        GPU.End();
                    });
                }
                else {
                    line.delete();
                }
                break;
            case "trash":
                let box = dragged;
                box.delete();
                break;
        }
        modus = "none";
        HideTrash();
        ev.stopPropagation();
    };
    area.onmousemove = (ev) => {
        let position = { x: ev.clientX - field.offsetLeft, y: ev.clientY - field.offsetTop };
        switch (modus) {
            case "none":
                break;
            case "all":
                let diff = { x: position.x - start.x, y: position.y - start.y };
                for (let i = 0; i < all.length; i++) {
                    all[i].moveBy(diff.x, diff.y);
                }
                start = position;
                break;
            case "box":
            case "trash":
                let box = dragged;
                box.moveTo(position.x, position.y);
                break;
            case "line":
                let line = dragged;
                line.setEnd(position.x, position.y);
                break;
        }
        ev.stopPropagation();
    };
    trash.onmouseenter = (ev) => {
        if (modus == "box") {
            modus = "trash";
        }
    };
    trash.onmouseleave = (ev) => {
        if (modus == "trash") {
            modus = "box";
        }
    };
}
export function AddBox(box) {
    all.push(box);
    field.append(box.body);
}
export function RemoveBox(box) {
    let idx = all.indexOf(box);
    all.splice(idx, 1);
    field.removeChild(box.body);
}
export function ShowTrash() {
    area.append(trash);
}
export function HideTrash() {
    trash.remove();
}
export class Box {
    inputs;
    outputs;
    maxInputs;
    updated;
    result;
    body;
    x;
    y;
    constructor(maxInputs) {
        this.body = document.createElement("div");
        this.body.className = "box";
        this.inputs = [];
        this.outputs = [];
        this.maxInputs = maxInputs;
        this.updated = false;
        this.result = undefined;
        this.x = field.clientWidth / 2;
        this.y = field.clientHeight / 2;
        this.body.onmousedown = (ev) => {
            if (ev.ctrlKey || ev.metaKey) {
                dragged = new Line(this);
                modus = "line";
            }
            else {
                dragged = this;
                modus = "box";
                ShowTrash();
            }
            ev.stopPropagation();
        };
        this.body.onmouseenter = (ev) => {
            setTimeout(() => {
                if (modus == "line") {
                    let line = dragged;
                    if (line.start != this) {
                        line.end = this;
                    }
                }
            }); //delay because enter of the child fires before the leave
            ev.stopPropagation();
        };
        this.body.onmouseleave = (ev) => {
            if (modus == "line") {
                let line = dragged;
                line.end = undefined;
            }
            ev.stopPropagation();
        };
    }
    delete() {
        while (this.outputs.length > 0) {
            this.outputs[0].delete();
        }
        while (this.inputs.length > 0) {
            this.inputs[0].delete();
        }
        RemoveBox(this);
    }
    moveBy(x, y) {
        this.moveTo(this.x + x, this.y + y);
    }
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].setStart(x, y);
        }
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setEnd(x, y);
        }
        this.body.style.marginLeft = (x - this.body.offsetWidth / 2).toString() + "px";
        this.body.style.marginTop = (y - this.body.offsetHeight / 2).toString() + "px";
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
export class Line {
    line;
    start;
    end;
    constructor(start) {
        this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.start = start;
        this.end = undefined;
        this.line.setAttribute("x1", start.x.toString());
        this.line.setAttribute("y1", start.y.toString());
        this.line.setAttribute("x2", start.x.toString());
        this.line.setAttribute("y2", start.y.toString());
        svg.append(this.line);
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
