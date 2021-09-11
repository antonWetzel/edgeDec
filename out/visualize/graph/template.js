import * as Request from '../../helper/request.js';
import * as Shader from './shader.js';
import * as Graph from './graph.js';
let infos;
export async function Setup() {
    infos = JSON.parse(await Request.getFile("../templates/info.json"));
}
export async function New() {
    let area = document.createElement("div");
    area.className = "popArea";
    document.body.appendChild(area);
    let scroll = document.createElement("scroll");
    scroll.className = "scroll";
    area.append(scroll);
    area.onclick = async () => {
        area.remove();
    };
    for (let key in infos) {
        let info = infos[key];
        let button = document.createElement("div");
        button.className = "button";
        let name = document.createElement("div");
        name.className = "name";
        name.innerText = key;
        button.append(name);
        let tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerText = info.tooltip;
        button.append(tooltip);
        scroll.appendChild(button);
        button.onclick = async (ev) => {
            let template = JSON.parse(await Request.getFile("../templates/" + key + ".json"));
            let boxes = [];
            for (let i = 0; i < template.length; i++) {
                let info = template[i];
                let box = new Shader.Shader();
                let src = await Request.getFile("../shaders/" + info.category + "/" + info.name + ".wgsl");
                let shaderInfo = Shader.infos[info.category][info.name];
                box.Setup(info.name, src, shaderInfo);
                for (let i = 0; i < info.inputs.length; i++) {
                    let line = new Graph.Line(boxes[info.inputs[i]]);
                    line.end = box;
                    boxes[info.inputs[i]].outputs.push(line);
                    box.inputs.push(line);
                }
                boxes.push(box);
            }
            for (let i = 0; i < boxes.length; i++) {
                let box = boxes[i];
                let x = box.x;
                for (let i = 0; i < box.inputs.length; i++) {
                    let start = box.inputs[i].start;
                    x = Math.max(x, start.x + 250);
                }
                box.moveBy(x - box.x, 0);
            }
            let counts = {};
            for (let i = 0; i < boxes.length; i++) {
                let box = boxes[i];
                let x = box.x;
                let y = counts[x];
                if (y == undefined) {
                    counts[x] = 1;
                    y = 0;
                }
                else {
                    counts[x] = y + 1;
                }
                box.moveBy(0, y * 100);
            }
        };
    }
}
