import * as Box from './box.js';
import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
import * as Request from '../helper/request.js';
import * as Graph from './graph.js';
let infos;
export async function Setup() {
    let locations = JSON.parse(await Request.getFile("../shaders/info.json"));
    infos = {};
    for (let i = 0; i < locations.length; i++) {
        let category = JSON.parse(await Request.getFile("../shaders/" + locations[i] + "/info.json"));
        infos[locations[i]] = category;
    }
}
export class Shader extends Box.Box {
    constructor() {
        super(0);
        this.compute = undefined;
        this.buffer = null;
    }
    async Setup(category, name) {
        let info = infos[category][name];
        this.compute = await GPU.NewCompute("../shaders/" + category + "/" + name + ".wgsl");
        let body = document.createElement("div");
        body.className = "shader";
        body.innerHTML = name;
        this.maxInputs = info.inputs;
        this.body.append(body);
        this.result = await Texture.Blanc(1, 1);
        let parameter;
        if (info.parameter.length > 0) {
            parameter = [];
            for (let i = 0; i < info.parameter.length; i++) {
                parameter.push(info.parameter[i].default);
            }
            this.buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM);
        }
        this.body.onclick = (ev) => {
            ev.stopPropagation();
            if (info.parameter.length > 0) {
                let area = document.createElement("div");
                area.className = "popArea";
                document.body.appendChild(area);
                let scroll = document.createElement("scroll");
                scroll.className = "scroll";
                area.append(scroll);
                for (let i = 0; i < info.parameter.length; i++) {
                    let param = info.parameter[i];
                    let div = document.createElement("div");
                    let name = document.createElement("div");
                    div.className = "shader";
                    name.className = "name";
                    name.innerText = param.name;
                    div.append(name);
                    let bot = document.createElement("div");
                    bot.className = "bot";
                    let input = document.createElement("input");
                    input.type = "range";
                    let number = document.createElement("div");
                    number.className = "number";
                    input.min = param.min.toString();
                    input.step = param.step.toString();
                    input.max = param.max.toString();
                    input.value = parameter[i].toString();
                    number.innerText = input.value;
                    div.append(bot);
                    bot.append(input);
                    bot.append(number);
                    input.oninput = () => {
                        parameter[i] = parseFloat(input.value);
                        number.innerText = input.value;
                    };
                    div.onclick = (ev) => { ev.stopPropagation(); };
                    scroll.appendChild(div);
                }
                area.onclick = async () => {
                    area.remove();
                    this.buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM);
                    this.recursiveReset();
                    GPU.Start();
                    await this.recursiveUpdate();
                    GPU.End();
                };
            }
        };
        Graph.AddBox(this);
        this.moveBy(0, 0);
    }
    async update() {
        if (this.inputs.length != this.maxInputs) {
            return;
        }
        let inputs = [];
        for (let i = 0; i < this.inputs.length; i++) {
            let result = this.inputs[i].start.result;
            if (result.width == 1 && result.height == 1) {
                return;
            }
            inputs.push(result);
        }
        if (this.result.width != inputs[0].width || this.result.height != inputs[0].height) {
            this.result = await Texture.Blanc(inputs[0].width, inputs[0].height);
        }
        this.compute.Calculate(inputs, this.buffer, this.result);
    }
}
export async function New() {
    let area = document.createElement("div");
    area.className = "popArea";
    document.body.appendChild(area);
    area.onclick = async () => {
        area.remove();
    };
    for (let cateName in infos) {
        let scroll = document.createElement("div");
        scroll.className = "scroll";
        area.append(scroll);
        let head = document.createElement("div");
        head.className = "head";
        head.innerText = cateName;
        scroll.append(head);
        let category = infos[cateName];
        for (let key in category) {
            let button = document.createElement("div");
            button.className = "button";
            let name = document.createElement("div");
            name.className = "name";
            name.innerText = key;
            button.append(name);
            let tooltip = document.createElement("div");
            tooltip.className = "tooltip";
            tooltip.innerText = category[key].tooltip;
            button.append(tooltip);
            scroll.appendChild(button);
            button.onclick = async (ev) => {
                let shader = new Shader();
                await shader.Setup(cateName, key);
            };
        }
    }
}
