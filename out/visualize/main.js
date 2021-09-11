import * as Graph from './graph.js';
import * as Source from './source.js';
import * as Shader from './shader.js';
import * as Matrix from './matrix.js';
import * as Display from './display.js';
import * as Template from './template.js';
import * as GPU from '../gpu/gpu.js';
import * as Stylesheet from '../helper/stylesheet.js';
document.body.onload = async () => {
    let setupButton = (id, cb) => {
        let x = document.getElementById(id + "Button");
        if (x == null) {
            alert("id problem");
            return;
        }
        x.onclick = cb;
    };
    setupButton("webcam", (ev) => { Source.Webcam(); });
    setupButton("file", (ev) => { Source.File(); });
    setupButton("shader", (ev) => { Shader.New(); });
    setupButton("matrix", (ev) => { new Matrix.Matrix().Setup(); });
    setupButton("custom", (ev) => { Shader.Custom(ev); });
    setupButton("display", (ev) => { new Display.Display().Setup(); });
    setupButton("template", (ev) => { Template.New(); });
    try {
        await GPU.Setup();
    }
    catch {
        document.body.innerHTML = "";
        let error = document.createElement("div");
        error.id = "error";
        error.innerText = "Problem with WebGPU";
        document.body.append(error);
        return;
    }
    await Graph.Setup();
    await Shader.Setup();
    await Matrix.Setup();
    await Template.Setup();
    document.body.onkeydown = (ev) => {
        if (ev.code == "KeyC") {
            Stylesheet.SetColor(true);
        }
    };
    Stylesheet.SetColor(false);
};
