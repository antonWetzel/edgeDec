import * as Graph from './graph.js';
import * as GPU from '../gpu/gpu.js';
let dragged = null;
export function New(x, y, maxInputs) {
    let box = document.createElement("div");
    box.className = "box";
    box.inputs = [];
    box.outputs = [];
    box.maxInputs = maxInputs;
    box.updated = false;
    setPostion(box, x, y);
    Graph.area.append(box);
    box.draggable = true;
    box.delete = () => {
        for (let i = 0; i < box.outputs.length; i++) {
            let end = box.outputs[i].end;
            let idx = end.inputs.indexOf(box.outputs[i]);
            end.inputs.splice(idx, 1);
            box.outputs[i].remove();
        }
        for (let i = 0; i < box.inputs.length; i++) {
            let start = box.inputs[i].start;
            let idx = start.outputs.indexOf(box.inputs[i]);
            start.outputs.splice(idx, 1);
            box.inputs[i].remove();
        }
        box.inputs = [];
        box.outputs = [];
        box.remove();
    };
    box.ondragstart = (ev) => {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        if (ev.ctrlKey) {
            dragged = newLine(box);
        }
        else {
            Graph.thrash.style.display = "unset";
        }
        let div = document.createElement("div");
        if (ev.dataTransfer != null) {
            ev.dataTransfer.setDragImage(div, 0, 0);
        }
    };
    box.ondrag = (ev) => {
        ev.stopPropagation();
        if (ev.pageX != 0 || ev.pageY != 0) {
            if (dragged == null) {
                setPostion(box, ev.pageX, ev.pageY);
                let { x, y } = position(box);
                for (let i = 0; i < box.outputs.length; i++) {
                    box.outputs[i].setAttribute("x1", x.toString() + "px");
                    box.outputs[i].setAttribute("y1", y.toString() + "px");
                }
                for (let i = 0; i < box.inputs.length; i++) {
                    box.inputs[i].setAttribute("x2", x.toString() + "px");
                    box.inputs[i].setAttribute("y2", y.toString() + "px");
                }
            }
            else {
                let x = ev.pageX - Graph.area.offsetLeft;
                let y = ev.pageY - Graph.area.offsetTop;
                dragged.setAttribute("x2", x.toString() + "px");
                dragged.setAttribute("y2", y.toString() + "px");
            }
        }
    };
    box.ondragenter = (ev) => {
        ev.stopPropagation();
        setTimeout(() => {
            if (dragged != null) {
                if (dragged.start != box) {
                    dragged.end = box;
                }
            }
        }); //delay because enter of the child fires before the leave
    };
    box.ondragleave = (ev) => {
        ev.stopPropagation();
        if (dragged != null) {
            if (dragged.start != box) {
                if (ev.pageX != 0 && ev.pageY != 0) {
                    dragged.end = undefined;
                }
            }
        }
    };
    box.ondragend = async (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        if (dragged != null) {
            if (dragged.end != undefined) {
                let start = dragged.start;
                let end = dragged.end;
                for (let i = 0; i < start.outputs.length; i++) {
                    if (start.outputs[i].end == end) {
                        start.outputs[i].delete();
                        dragged.remove();
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
                    dragged.remove();
                    return;
                }
                start.outputs.push(dragged);
                end.inputs.push(dragged);
                let { x, y } = position(end);
                dragged.setAttribute("x2", x.toString() + "px");
                dragged.setAttribute("y2", y.toString() + "px");
                if (end.inputs.length > end.maxInputs) {
                    end.inputs[0].delete();
                }
                end.recursiveReset();
                GPU.Start();
                await end.recursiveUpdate();
                GPU.End();
            }
            else {
                dragged.remove();
            }
            dragged = null;
        }
        else {
            Graph.thrash.style.display = "none";
            let p = position(box);
            if (p.x * p.x + p.y * p.y < 100 * 100) {
                box.delete();
            }
        }
    };
    box.move = (x, y) => {
        let p = position(box);
        p.x += x;
        p.y += y;
        setPostion(box, p.x, p.y);
        for (let i = 0; i < box.outputs.length; i++) {
            box.outputs[i].setAttribute("x1", p.x.toString() + "px");
            box.outputs[i].setAttribute("y1", p.y.toString() + "px");
        }
        for (let i = 0; i < box.inputs.length; i++) {
            box.inputs[i].setAttribute("x2", p.x.toString() + "px");
            box.inputs[i].setAttribute("y2", p.y.toString() + "px");
        }
        setPostion(box, p.x, p.y);
    };
    box.cycleCheck = (checked) => {
        if (checked == box) {
            return true;
        }
        for (let i = 0; i < box.outputs.length; i++) {
            if (box.outputs[i].end.cycleCheck(checked)) {
                return true;
            }
        }
        return false;
    };
    box.recursiveUpdate = async () => {
        for (let i = 0; i < box.inputs.length; i++) {
            if (box.inputs[i].start.updated == false) {
                return;
            }
        }
        await box.update();
        box.updated = true;
        for (let i = 0; i < box.outputs.length; i++) {
            await box.outputs[i].end.recursiveUpdate();
        }
    };
    box.recursiveReset = () => {
        if (box.updated) {
            box.updated = false;
            for (let i = 0; i < box.outputs.length; i++) {
                box.outputs[i].end.recursiveReset();
            }
        }
    };
    return box;
}
export function newLine(start) {
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.start = start;
    let p = position(start);
    line.setAttribute("x1", p.x.toString());
    line.setAttribute("y1", p.y.toString());
    line.setAttribute("x2", p.x.toString());
    line.setAttribute("y2", p.y.toString());
    Graph.svg.append(line);
    line.delete = () => {
        let idx = line.start.outputs.indexOf(line);
        line.start.outputs.splice(idx, 1);
        idx = line.end.inputs.indexOf(line);
        line.end.inputs.splice(idx, 1);
        line.remove();
    };
    return line;
}
export function position(element) {
    let x = element.offsetLeft + element.clientWidth / 2 + Graph.area.clientLeft;
    let y = element.offsetTop + element.clientHeight / 2 + Graph.area.clientTop;
    return { x: x, y: y };
}
export function setPostion(element, x, y) {
    element.style.left = (x - element.clientWidth / 2 - Graph.area.clientLeft).toString() + "px";
    element.style.top = (y - element.clientHeight / 2 - Graph.area.clientTop).toString() + "px";
}
