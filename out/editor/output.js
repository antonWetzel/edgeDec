import * as GPU from '../gpu/gpu.js';
import * as Info from '../helper/info.js';
import * as Texture from '../gpu/texture.js';
import * as Input from './input.js';
let canvas;
let texture;
export async function Setup() {
    let output = document.getElementById("output");
    canvas = await GPU.Create();
    output.append(canvas);
    canvas.resize(output.clientWidth, output.clientHeight);
    document.body.onresize = (ev) => {
        canvas.resize(output.clientWidth, output.clientHeight);
    };
    texture = await Texture.Blanc(1, 1);
}
export async function Update(src) {
    let info = Info.Parse(src);
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
        console.log("no inputs");
        return;
    }
    if (Input.textures[0].width != texture.width || Input.textures[0].height != texture.height) {
        texture = await Texture.Blanc(Input.textures[0].width, Input.textures[0].height);
    }
    console.clear();
    GPU.Start();
    calc.Calculate(Input.textures, buffer, texture);
    canvas.draw(texture);
    GPU.End();
}
