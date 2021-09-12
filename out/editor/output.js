import * as GPU from '../gpu/gpu.js';
import * as Info from '../helper/info.js';
import * as Texture from '../gpu/texture.js';
import * as Input from './input.js';
let output;
let canvas;
let errorText;
let texture;
export async function Setup() {
    output = document.getElementById("output");
    canvas = await GPU.Create();
    errorText = document.createElement("div");
    errorText.id = "errorText";
    texture = await Texture.Blanc(1, 1);
}
export async function Update(src) {
    let info = Info.Parse(src);
    if (typeof info == "string") {
        Error(info);
        return;
    }
    GPU.device.pushErrorScope('validation');
    let calc = await GPU.NewCompute(src);
    let buffer;
    if (info.parameter.length > 0) {
        let params = new Float32Array(info.parameter.length);
        for (let i = 0; i < info.parameter.length; i++) {
            params[i] = info.parameter[i].default;
        }
        buffer = GPU.CreateBuffer(params, GPUBufferUsage.UNIFORM);
    }
    else {
        buffer = null;
    }
    if (Input.textures.length == 0) {
        Error("no inputs");
        return;
    }
    if (Input.textures[0].width != texture.width || Input.textures[0].height != texture.height) {
        texture = await Texture.Blanc(Input.textures[0].width, Input.textures[0].height);
        canvas.resize(texture.width, texture.height);
    }
    output.style.display = "flex";
    errorText.remove();
    output.append(canvas);
    GPU.Start();
    calc.Calculate(Input.textures, buffer, texture);
    canvas.draw(texture);
    GPU.End();
    let error = await GPU.device.popErrorScope();
    if (error != null) {
        Error(error.message);
        return;
    }
}
function Error(text) {
    canvas.remove();
    output.append(errorText);
    output.style.display = "unset";
    errorText.innerText = text;
}
