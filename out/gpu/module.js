import * as GPU from './gpu.js';
export async function New(src) {
    let module = GPU.device.createShaderModule({
        code: src
    });
    return module;
}
