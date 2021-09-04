import * as box from './box.js';
import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
import * as Request from '../helper/request.js';
let infos;
export async function Setup() {
    infos = JSON.parse(await Request.getFile("../shaders/infos.json"));
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
        let button = document.createElement("button");
        let name = document.createElement("div");
        name.className = "name";
        name.innerText = key;
        button.append(name);
        let tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerText = infos[key].tooltip;
        button.append(tooltip);
        scroll.appendChild(button);
        button.onclick = async (ev) => {
            await NewWithName(key);
        };
    }
}
export async function NewWithName(name) {
    let info = infos[name];
    let compute = await GPU.NewCompute("../shaders/" + name + ".wgsl");
    let body = document.createElement("div");
    body.className = "shader";
    body.innerHTML = name;
    let b = box.New(200, 200, info.inputs);
    b.append(body);
    b.result = await Texture.Blanc(1, 1);
    let buffer;
    let parameter;
    if (info.parameter.length > 0) {
        parameter = [];
        for (let i = 0; i < info.parameter.length; i++) {
            parameter.push(info.parameter[i].min);
        }
        buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM);
    }
    else {
        buffer = null;
    }
    b.update = async () => {
        if (b.inputs.length != b.maxInputs) {
            return;
        }
        let inputs = [];
        for (let i = 0; i < b.inputs.length; i++) {
            let result = b.inputs[i].start.result;
            if (result.width == 1 && result.height == 1) {
                return;
            }
            inputs.push(result);
        }
        if (b.result.width != inputs[0].width || b.result.height != inputs[0].height) {
            b.result = await Texture.Blanc(inputs[0].width, inputs[0].height);
        }
        compute.Calculate(inputs, buffer, b.result);
    };
    b.onclick = (ev) => {
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
                input.onchange = () => {
                    parameter[i] = parseFloat(input.value);
                    number.innerText = input.value;
                };
                div.onclick = (ev) => { ev.stopPropagation(); };
                scroll.appendChild(div);
            }
            area.onclick = async () => {
                area.remove();
                buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM);
                b.recursiveReset();
                GPU.Start();
                await b.recursiveUpdate();
                GPU.End();
            };
        }
    };
    return b;
}
