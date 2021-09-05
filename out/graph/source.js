import * as Box from './box.js';
import * as GPU from '../gpu/gpu.js';
import * as Texture from '../gpu/texture.js';
import * as Graph from './graph.js';
export class Source extends Box.Box {
    constructor() {
        super(300, 300, 0);
        this.zoom = 1;
        this.width = 1;
        this.height = 1;
    }
    async SetupImage(src) {
        let img = document.createElement("img");
        img.draggable = false;
        this.body.append(img);
        img.src = URL.createObjectURL(src);
        this.result = await Texture.FromImage(img);
        this.updated = true;
        this.width = img.width;
        this.height = img.height;
        this.body.onwheel = async (ev) => {
            this.zoom *= 1 + ev.deltaY / 1000;
            if (this.result.width * this.zoom < 30) {
                this.zoom = 30 / this.result.width;
            }
            else if (this.result.width * this.zoom > 2000) {
                this.zoom = 2000 / this.result.width;
            }
            img.width = this.width * this.zoom;
            img.height = this.height * this.zoom;
            await this.moveBy(0, 0);
        };
        await this.moveBy(0, 0);
        Graph.AddBox(this);
    }
    async SetupVIdeo(src) {
        let vid = document.createElement("video");
        this.body.append(vid);
        if ("active" in src) {
            vid.srcObject = src;
        }
        else {
            vid.src = URL.createObjectURL(src);
        }
        vid.volume = 0;
        vid.autoplay = true;
        vid.loop = true;
        let handle;
        vid.onplay = async () => {
            this.width = vid.videoWidth;
            this.height = vid.videoHeight;
            let cb = async () => {
                this.result = await Texture.FromVideo(vid);
                this.recursiveReset();
                GPU.Start();
                await this.recursiveUpdate();
                GPU.End();
                handle = requestAnimationFrame(cb);
            };
            cb();
            await this.moveBy(0, 0);
        };
        vid.onpause = () => {
            cancelAnimationFrame(handle);
            vid.play();
        };
        this.body.onwheel = async (ev) => {
            this.zoom *= 1 + ev.deltaY / 1000;
            if (this.result.width * this.zoom < 30) {
                this.zoom = 30 / this.result.width;
            }
            else if (this.result.width * this.zoom > 2000) {
                this.zoom = 2000 / this.result.width;
            }
            vid.width = this.width * this.zoom;
            vid.height = this.height * this.zoom;
            await this.moveBy(0, 0);
        };
        this.updated = true;
        Graph.AddBox(this);
    }
    async update() { }
}
export async function File() {
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
export async function Webcam() {
    try {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        let cam = new Source();
        cam.SetupVIdeo(stream);
    }
    catch (ev) {
        alert("webcam not found");
    }
}
