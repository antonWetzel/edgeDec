import * as Box from './box.js';
import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
import * as Graph from './graph.js';
export class Source extends Box.Box {
    constructor() {
        super(100, 100, 0);
    }
    async SetupImage(file) {
        let img = document.createElement("img");
        img.draggable = false;
        this.body.append(img);
        img.src = URL.createObjectURL(file);
        this.result = await Texture.FromImage(img);
        this.updated = true;
        Graph.AddBox(this);
    }
    async SetupVIdeo(file) {
        let vid = document.createElement("video");
        this.body.append(vid);
        vid.src = URL.createObjectURL(file);
        vid.volume = 0;
        vid.autoplay = true;
        vid.loop = true;
        let handle;
        vid.onplay = () => {
            let cb = async () => {
                this.result = await Texture.FromVideo(vid);
                this.recursiveReset();
                GPU.Start();
                await this.recursiveUpdate();
                GPU.End();
                handle = requestAnimationFrame(cb);
            };
            cb();
        };
        vid.onpause = () => {
            cancelAnimationFrame(handle);
            vid.play();
        };
        this.updated = true;
        Graph.AddBox(this);
    }
    async update() { }
}
export async function New() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = 'image/png,image/jpeg,video/mp4,video/webm';
    input.onchange = async () => {
        let files = input.files;
        if (files == null || files.length == 0) {
            return;
        }
        let file = files[0];
        let sep = file.name.split(".");
        switch (sep[sep.length - 1]) {
            case "png":
            case "jpg":
                let img = new Source();
                await img.SetupImage(file);
                break;
            case "mp4":
            case "webm":
                let vid = new Source();
                await vid.SetupVIdeo(file);
                break;
            default:
                alert("file format not allowed");
                break;
        }
    };
    input.click();
}
