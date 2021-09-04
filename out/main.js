import * as Graph from './graph/graph.js';
import * as File from './graph/file.js';
import * as Display from './graph/display.js';
import * as Shader from './graph/shader.js';
import * as Webcam from './graph/webcam.js';
import * as Template from './graph/template.js';
import * as GPU from './gpu/gpu.js';
document.body.onload = function () {
    let area = document.getElementById("area");
    let setupButton = (id, cb) => {
        let x = document.getElementById(id + "Button");
        if (x == null) {
            alert("id problem");
            return;
        }
        x.onclick = cb;
    };
    setupButton("file", File.New);
    setupButton("display", Display.New);
    setupButton("shader", Shader.New);
    setupButton("webcam", Webcam.New);
    setupButton("template", Template.New);
    Graph.Setup(area);
    GPU.Setup();
};
