import * as Shader from './shader.js';
import * as Matrix from './matrix.js';
import * as Template from './template.js';
export let area;
export let thrash;
export let svg;
let start = { x: 0, y: 0 };
export async function Setup(container) {
    area = container;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    area.append(svg);
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
            //skip svg and thrash
            for (let i = 2; i < area.children.length; i++) {
                let box = area.children[i];
                box.move(ev.clientX - start.x, ev.clientY - start.y);
            }
            start = { x: ev.clientX, y: ev.clientY };
        }
    };
    await Shader.Setup();
    await Matrix.Setup();
    await Template.Setup();
}
