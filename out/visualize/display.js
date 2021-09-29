import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
import * as Graph from './graph.js';
export class Display extends Graph.Box {
    canvas;
    zoom;
    constructor() {
        super(1);
        this.canvas = undefined;
        this.zoom = 1;
    }
    async Setup() {
        this.canvas = await GPU.Create();
        this.body.append(this.canvas);
        this.result = await Texture.Blanc(1, 1);
        this.body.onwheel = async (ev) => {
            this.zoom *= 1 + ev.deltaY / 1000;
            if (this.result.width != 1 || this.result.height != 1) {
                if (this.result.width * this.zoom < 30) {
                    this.zoom = 30 / this.result.width;
                }
                else if (this.result.width * this.zoom > 2000) {
                    this.zoom = 2000 / this.result.width;
                }
                this.canvas.resize(this.result.width * this.zoom, this.result.height * this.zoom);
                this.moveBy(0, 0);
                GPU.Start();
                this.update();
                GPU.End();
            }
        };
        Graph.AddBox(this);
        this.moveBy(0, 0);
    }
    async update() {
        if (this.inputs.length == 1) {
            let input = this.inputs[0].start;
            if (input.result.width == 1 && input.result.height == 1) {
                return;
            }
            if (input.result.width != this.result.width || input.result.height != this.result.height) {
                this.canvas.resize(input.result.width * this.zoom, input.result.height * this.zoom);
                this.moveBy(0, 0);
            }
            this.result = input.result;
            this.canvas.draw(this.result);
        }
    }
}
