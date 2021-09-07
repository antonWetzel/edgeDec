import * as Box from './box.js';
import * as Graph from './graph.js';
export class Custom extends Box.Box {
    constructor() {
        super(0);
        this.compute = undefined;
        this.buffer = null;
    }
    async Setup(src, info) {
        this.moveBy(0, 0);
        Graph.AddBox(this);
    }
    async update() {
    }
}
export async function New() {
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
        let files = input.files;
        if (files == null || files.length == 0) {
            return;
        }
        let file = files[0];
        let sep = file.name.split(".");
        let format = sep[sep.length - 1];
        if (format != "wgsl") {
            alert("onyl 'wgsl' is supported, not '" + format + "'");
            return;
        }
        let src = await file.text();
        let info = src.split("\n")[0].substr(2);
        console.log(info);
    };
    input.click();
}
