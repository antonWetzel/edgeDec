import * as box from './box.js';
import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
export async function New() {
    let c = await GPU.Create();
    let b = box.New(300, 300, 1);
    b.append(c);
    b.result = await Texture.Blanc(1, 1);
    b.update = async () => {
        if (b.inputs.length == 1) {
            let input = b.inputs[0].start;
            if (input.result.width == 1 && input.result.height == 1) {
                return;
            }
            b.result = input.result;
            if (c.width != b.result.width || c.height != b.result.height) {
                c.resize(b.result.width, b.result.height);
                setTimeout(b.move, 0, 0, 0);
            }
            c.draw(b.result);
        }
    };
}
