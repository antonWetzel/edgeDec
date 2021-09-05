import * as Graph from './graph/graph.js';
import * as Source from './graph/source.js';
import * as Shader from './graph/shader.js';
import * as Matrix from './graph/matrix.js';
import * as Display from './graph/display.js';
import * as Template from './graph/template.js';
import * as GPU from './gpu/gpu.js';
document.body.onload = async () => {
    let area = document.getElementById("area");
    let setupButton = (id, cb) => {
        let x = document.getElementById(id + "Button");
        if (x == null) {
            alert("id problem");
            return;
        }
        x.onclick = cb;
    };
    setupButton("file", () => { Source.File(); });
    setupButton("display", () => { new Display.Display().Setup(); });
    setupButton("shader", () => { Shader.New(); });
    setupButton("matrix", () => { new Matrix.Matrix().Setup(); });
    setupButton("webcam", () => { Source.Webcam(); });
    setupButton("template", Template.New);
    try {
        await GPU.Setup();
    }
    catch (error) {
        alert("Problem with WebGPU");
    }
    Graph.Setup(area);
};
