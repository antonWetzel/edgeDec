"use strict";
/** predifined templates */
var template;
(function (template) {
    template.all = {
        "minimal": [
            { name: "gray", inputs: [] },
            { name: "laplaceB", inputs: [0] },
            { name: "edgeValue", inputs: [1] },
            { name: "threshhold", inputs: [2] },
            { name: "inverse", inputs: [3] },
        ],
        "canny": [
            { name: "gray", inputs: [] },
            { name: "blurr3", inputs: [0] },
            { name: "sobelX", inputs: [1] },
            { name: "sobelY", inputs: [1] },
            { name: "edgeValue", inputs: [2] },
            { name: "edgeValue", inputs: [3] },
            { name: "euclidean", inputs: [4, 5] },
            { name: "grad", inputs: [2, 3] },
            { name: "suppression", inputs: [6, 7] },
            { name: "threshhold", inputs: [8] },
            { name: "inverse", inputs: [9] },
        ],
        "simple": [
            { name: "nothing", inputs: [] },
            { name: "robertsA", inputs: [0] },
            { name: "robertsB", inputs: [0] },
            { name: "edgeValue", inputs: [1] },
            { name: "edgeValue", inputs: [2] },
            { name: "max", inputs: [3, 4] },
            { name: "grayMax", inputs: [5] },
            { name: "threshhold", inputs: [6] },
            { name: "inverse", inputs: [7] },
        ],
    };
})(template || (template = {}));
