import * as Shader from './shader.js';
import * as Matrix from './matrix.js';
import * as Template from './template.js';
export let area;
export let thrash;
export let svg;
let start;
let all;
export async function Setup(container) {
    area = container;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    area.append(svg);
    all = [];
    start = { x: 0, y: 0 };
    thrash = document.createElement("div");
    thrash.className = "thrash";
    thrash.style.display = "none";
    area.append(thrash);
    area.draggable = true;
    area.ondragstart = (ev) => {
        let img = document.createElement("img");
        if (ev.dataTransfer != null) {
            ev.dataTransfer.setDragImage(img, 0, 0);
        }
        start = { x: ev.clientX, y: ev.clientY };
    };
    area.ondrag = (ev) => {
        ev.stopPropagation();
        if (!ev.ctrlKey) {
            if (ev.clientX == 0 && ev.clientY == 0) {
                return;
            }
            if (ev.pageX != ev.screenX) {
                return;
            }
            for (let i = 0; i < all.length; i++) {
                let box = all[i];
                box.moveBy(ev.clientX - start.x, ev.clientY - start.y);
            }
            start = { x: ev.clientX, y: ev.clientY };
        }
    };
    await Shader.Setup();
    await Matrix.Setup();
    await Template.Setup();
}
export function AddBox(box) {
    all.push(box);
    area.append(box.body);
}
export function RemoveBox(box) {
    let idx = all.indexOf(box);
    all.splice(idx, 1);
    area.removeChild(box.body);
}
