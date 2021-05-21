"use strict";
var graph;
(function (graph) {
    const fontHeight = 20;
    const vertexShaderData = `
	attribute vec2 position;
	varying vec2 uv;
		
	void main() {
		uv = position/2.0 + 0.5;
		gl_Position = vec4(position.x, position.y, 0.0, 1.0);
	}`;
    let screen;
    let all;
    const border = 5;
    class drawable {
        constructor(l, w, h, result) {
            this.x = screen.canvas.width * 1 / 6 + w;
            this.y = screen.canvas.height * 1 / 6 + h;
            this.w = w;
            this.h = h;
            this.inputs = [];
            this.result = result;
            this.selected = false;
            this.l = l;
        }
        addInput(x) {
            for (let i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i] == x) {
                    this.inputs.splice(i, 1);
                    return;
                }
            }
            this.inputs.push(x);
            if (this.inputs.length > this.l) {
                this.inputs.shift();
            }
        }
        update() {
            //may be overwritten by implementation
        }
        edit(_key) {
            //may be overwritten by implementation
        }
        draw() {
            if (this.selected) {
                this.drawRect(color.boxSelected, true);
            }
            else {
                this.drawRect(color.boxNormal, true);
            }
            this.drawRect(color.boxBackground, false);
            this.fill();
        }
        inside(x, y) {
            return (this.x - this.w <= x && x < this.x + this.w &&
                this.y - this.h <= y && y < this.y + this.h);
        }
        move(x, y) {
            this.x += x;
            this.y += y;
        }
        moveAbs(x, y) {
            this.x = x;
            this.y = y;
        }
        drawImage(img) {
            screen.drawImage(img, this.x - this.w, this.y - this.h, this.w * 2, this.h * 2);
        }
        drawRect(color, full) {
            screen.fillStyle = color;
            if (full) {
                screen.fillRect(this.x - this.w - border, this.y - this.h - border, (this.w + border) * 2, (this.h + border) * 2);
            }
            else {
                screen.fillRect(this.x - this.w, this.y - this.h, this.w * 2, this.h * 2);
            }
        }
        drawText(text) {
            screen.fillStyle = color.text;
            let s = text.split("\n");
            for (let i = 0; i < s.length; i++) {
                screen.fillText(s[i], this.x, this.y + (i - s.length / 2 + 0.5) * fontHeight);
            }
        }
    }
    graph.drawable = drawable;
    class VideoSource extends drawable {
        constructor(vid) {
            vid.width = vid.videoWidth;
            vid.height = vid.videoHeight;
            super(0, vid.width / 2, vid.height / 2, vid);
            this.result = vid;
        }
        fill() {
            this.drawImage(this.result);
        }
        edit(key) {
            if (key == "m") {
                this.result.volume = 1 - this.result.volume;
            }
        }
    }
    class ImageSource extends drawable {
        constructor(img) {
            super(0, img.width / 2, img.height / 2, img);
        }
        fill() {
            this.drawImage(this.result);
        }
    }
    class Display extends drawable {
        constructor() {
            let canvas = document.createElement("canvas");
            super(1, 100, 100, canvas);
            this.result = canvas;
        }
        fill() {
            this.drawImage(this.result);
        }
        update() {
            if (this.inputs.length == 1) {
                let input = this.inputs[0].result;
                if (this.result.width != input.width) {
                    this.result.width = input.width;
                    this.w = input.width / 2;
                }
                if (this.result.height != input.height) {
                    this.result.height = input.height;
                    this.h = input.height / 2;
                }
                let ctx = this.result.getContext("2d");
                if (ctx == null) {
                    return;
                }
                ctx.drawImage(input, 0, 0);
            }
        }
        edit(key) {
            if (key == 'd') {
                var link = document.createElement('a');
                link.download = 'edgeDec.png';
                link.href = this.result.toDataURL();
                link.click();
            }
        }
    }
    class Operator extends drawable {
        constructor(l, w, h, result) {
            super(l, w, h, result);
            this.result = result;
            this.displayName = "";
        }
        fill() {
            this.drawText(this.displayName);
        }
        update() {
            let gl = this.result.getContext("webgl");
            if (gl == null) {
                return;
            }
            if (this.inputs.length == 0) {
                return;
            }
            let update = false;
            let input = this.inputs[0].result;
            if (this.result.width != input.width) {
                this.result.width = input.width;
                update = true;
            }
            if (this.result.height != input.height) {
                this.result.height = input.height;
                update = true;
            }
            let program = gl.getParameter(gl.CURRENT_PROGRAM);
            if (update) {
                gl.viewport(0, 0, input.width, input.height);
                let size = gl.getUniformLocation(program, "size");
                if (size != null) {
                    gl.uniform2f(size, input.width, input.height);
                }
            }
            let textures = [];
            let programm = gl.getParameter(gl.CURRENT_PROGRAM);
            for (let i = 0; i < this.inputs.length; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                let loc = gl.getUniformLocation(programm, "texture" + i.toString());
                if (loc != 0) {
                    gl.uniform1i(loc, i);
                }
                let texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.inputs[i].result);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                textures.push(texture);
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            for (let j = 0; j < textures.length; j++) {
                gl.deleteTexture(textures[j]);
            }
        }
    }
    class ShaderOperator extends Operator {
        constructor(l, name, result, param, values) {
            super(l, 0, fontHeight * param.length / 2 + 20, result);
            this.name = name;
            this.result = result;
            this.param = param;
            this.values = values;
            this.index = 0;
            this.updateName();
        }
        updateName() {
            this.displayName = this.name;
            let w = screen.measureText(this.name).width;
            for (let i = 0; i < this.param.length; i++) {
                let s = "";
                if (i == this.index) {
                    s += ">";
                }
                s += this.param[i] + ": " + this.values[i].toFixed(2);
                if (i == this.index) {
                    s += "<";
                }
                w = Math.max(w, screen.measureText(s).width);
                this.displayName += "\n" + s;
            }
            this.w = w / 2 + 20;
        }
        edit(key) {
            if (this.param.length == 0) {
                return;
            }
            if (key == "w" || key == "s") {
                if (key == "w") {
                    this.index -= 1;
                    if (this.index < 0) {
                        this.index = this.param.length - 1;
                    }
                }
                else {
                    this.index += 1;
                    if (this.index >= this.param.length) {
                        this.index = 0;
                    }
                }
                this.updateName();
            }
            else if (key == "a" || key == "d" || key == "q" || key == "e") {
                let x;
                switch (key) {
                    case "q":
                        x = -0.01;
                        break;
                    case "a":
                        x = -0.1;
                        break;
                    case "e":
                        x = 0.01;
                        break;
                    case "d":
                        x = 0.1;
                }
                this.values[this.index] += x;
                if (this.values[this.index] < 0) {
                    this.values[this.index] = 0;
                }
                if (this.values[this.index] > 1) {
                    this.values[this.index] = 1;
                }
                let gl = this.result.getContext("webgl");
                if (gl == null) {
                    return;
                }
                let program = gl.getParameter(gl.CURRENT_PROGRAM);
                let loc = gl.getUniformLocation(program, this.param[this.index]);
                if (loc != null) {
                    gl.uniform1f(loc, this.values[this.index]);
                }
                this.updateName();
            }
        }
    }
    class MatrixOperator extends Operator {
        constructor(result, mat) {
            super(1, 100, 100, result);
            this.values = mat;
            this.selectX = 0;
            this.selectY = 0;
            this.updateName();
            this.force = false;
        }
        updateName() {
            this.displayName = "";
            for (let i = 0; i < this.values.length; i++) {
                for (let j = 0; j < this.values.length; j++) {
                    let val = this.values[j][i];
                    if (j == this.selectX && i == this.selectY) {
                        this.displayName += ">";
                    }
                    else {
                        this.displayName += " ";
                    }
                    let s = val.toFixed(1);
                    for (let t = s.length; t < 4; t++) {
                        this.displayName += " ";
                    }
                    this.displayName += s;
                    if (j == this.selectX && i == this.selectY) {
                        this.displayName += "<";
                    }
                    else {
                        this.displayName += " ";
                    }
                }
                if (i < this.values.length - 1) {
                    this.displayName += "\n";
                }
            }
            this.w = screen.measureText(this.displayName.split("\n")[0]).width / 2 + 20;
            this.h = this.values.length * fontHeight;
        }
        edit(key) {
            switch (key) {
                case 'w':
                    this.selectY -= 1;
                    if (this.selectY < 0) {
                        this.selectY = this.values.length - 1;
                    }
                    break;
                case 's':
                    this.selectY += 1;
                    if (this.selectY >= this.values.length) {
                        this.selectY = 0;
                    }
                    break;
                case 'a':
                    this.selectX -= 1;
                    if (this.selectX < 0) {
                        this.selectX = this.values.length - 1;
                    }
                    break;
                case 'd':
                    this.selectX += 1;
                    if (this.selectX >= this.values.length) {
                        this.selectX = 0;
                    }
                    break;
                case 'r':
                case 'q':
                case 'e':
                case 'f':
                case 'g':
                    if (key == 'q' || key == 'e') {
                        let x = 1;
                        if (key == 'q') {
                            x *= -1;
                        }
                        this.values[this.selectX][this.selectY] += x;
                    }
                    else if (key == 'f') {
                        if (this.values.length <= 2) {
                            return;
                        }
                        this.values.pop();
                        for (let i = 0; i < this.values.length; i++) {
                            this.values[i].pop();
                        }
                        break;
                    }
                    else if (key == 'g') {
                        for (let i = 0; i < this.values.length; i++) {
                            this.values[i].push(0);
                        }
                        this.values.push([]);
                        for (let i = 0; i < this.values.length; i++) {
                            this.values[this.values.length - 1].push(0);
                        }
                    }
                    else if (key == "r") {
                        this.force = !this.force;
                    }
                    let canvas = createWebGLCanvas(createMatrixShader(this.values, this.force)).canvas;
                    if (canvas == null) {
                        console.log("error in matrix shader creator");
                        return;
                    }
                    this.result = canvas;
                    break;
                default:
                    return;
            }
            this.updateName();
        }
    }
    function setup() {
        let canvas = document.createElement("canvas");
        document.body.onresize = function () {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            screen.textAlign = "center";
            screen.textBaseline = "middle";
            screen.lineWidth = 3;
            screen.font = fontHeight.toString() + "px monospace";
        };
        document.body.appendChild(canvas);
        let t = canvas.getContext("2d");
        if (t == null) {
            return;
        }
        screen = t;
        document.body.onresize(new UIEvent(""));
        all = [];
        setInterval(draw, 1000 / 60);
    }
    graph.setup = setup;
    function addCustomOperator() {
        let mat = [[1, 1], [-1, -1]];
        let x = createOperator(createMatrixShader(mat, false), "custom", mat);
        if (x != null) {
            all.push(x);
        }
        return x;
    }
    graph.addCustomOperator = addCustomOperator;
    function addOperator(program) {
        if (program in shaders.all == false) {
            console.log("program does not exist");
            return null;
        }
        let x = createOperator(shaders.all[program], program);
        if (x != null) {
            all.push(x);
        }
        return x;
    }
    graph.addOperator = addOperator;
    function createWebGLCanvas(programData) {
        let canvas = document.createElement("canvas");
        let gl = canvas.getContext("webgl");
        if (gl == null) {
            console.log("context not found");
            return { "canvas": null, "texCount": 0, "param": [] };
        }
        let param = [];
        let texCount = 0;
        let split = programData.split(/[\s;]+/);
        for (let i = 0; i < split.length - 2; i++) { //last 2 can not be a full uniform decleration
            if (split[i] == "uniform") {
                if (split[i + 1] == "sampler2D") {
                    texCount++;
                }
                else if (split[i + 1] == "float") {
                    param.push(split[i + 2]);
                }
            }
        }
        let program = gl.createProgram();
        if (program == null) {
            console.log("could not create program");
            return { "canvas": null, "texCount": 0, "param": [] };
        }
        var datas = [vertexShaderData, programData];
        var types = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
        for (let i = 0; i < datas.length; i++) {
            let shader = gl.createShader(types[i]);
            if (shader == null) {
                console.log("could not create shader");
                return { "canvas": null, "texCount": 0, "param": [] };
            }
            gl.shaderSource(shader, datas[i]);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return { "canvas": null, "texCount": 0, "param": [] };
            }
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
            return { "canvas": null, "texCount": 0, "param": [] };
        }
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        if (buffer == null) {
            console.log("could not create buffer");
            return { "canvas": null, "texCount": 0, "param": [] };
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const positions = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        let pos = gl.getAttribLocation(program, "position");
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pos);
        return { "canvas": canvas, "texCount": texCount, "param": param };
    }
    function createOperator(programData, name, matrix = null) {
        let { canvas, texCount, param } = createWebGLCanvas(programData);
        if (canvas == null) {
            return null;
        }
        let values = [];
        for (let i = 0; i < param.length; i++) {
            values.push(0);
        }
        if (matrix != null) {
            return new MatrixOperator(canvas, matrix);
        }
        else {
            return new ShaderOperator(texCount, name, canvas, param, values);
        }
    }
    async function addWebcam() {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        let display = document.createElement("video");
        display.srcObject = stream;
        display.autoplay = true;
        return new Promise(function (resolve, _recect) {
            display.onplay = function () {
                let x = new VideoSource(display);
                all.push(x);
                resolve(x);
            };
        });
    }
    graph.addWebcam = addWebcam;
    async function addFile() {
        return new Promise(function (resolve, recect) {
            let input = document.createElement("input");
            input.type = "file";
            input.onchange = function () {
                let files = input.files;
                if (files == null || files.length == 0) {
                    recect("only one filed allowed");
                    return;
                }
                let file = files[0];
                let sep = file.name.split(".");
                switch (sep[sep.length - 1]) {
                    case "png":
                    case "jpg":
                        let img = document.createElement("img");
                        img.src = URL.createObjectURL(file);
                        img.onload = function () {
                            let x = new ImageSource(img);
                            all.push(x);
                            resolve(x);
                        };
                        break;
                    case "mp4":
                    case "webm":
                        let vid = document.createElement("video");
                        vid.src = URL.createObjectURL(file);
                        vid.onplay = function () {
                            let x = new VideoSource(vid);
                            all.push(x);
                            vid.volume = 0;
                            resolve(x);
                        };
                        vid.autoplay = true;
                        vid.loop = true;
                        break;
                    default:
                        recect("file format not allowed");
                }
            };
            input.click();
        });
    }
    graph.addFile = addFile;
    function addDisplay() {
        let dis = new Display();
        all.push(dis);
        return dis;
    }
    graph.addDisplay = addDisplay;
    function draw() {
        screen.fillStyle = color.background;
        let w = document.body.clientWidth;
        let h = document.body.clientHeight;
        screen.fillRect(0, 0, w, h);
        screen.strokeStyle = color.arrow;
        screen.beginPath();
        for (let i = 0; i < all.length; i++) {
            let d = all[i];
            for (let j = 0; j < d.inputs.length; j++) {
                arrow(d.inputs[j], d);
            }
        }
        screen.stroke();
        for (let i = 0; i < all.length; i++) {
            all[i].update();
        }
        for (let i = 0; i < all.length; i++) {
            all[i].draw();
        }
    }
    function arrow(s, d) {
        let sx = s.x;
        let sy = s.y;
        let dx = d.x;
        let dy = d.y;
        let diffX = dx - sx;
        let diffY = dy - sy;
        let len = Math.sqrt(diffX * diffX + diffY * diffY) / 6;
        let dirX = diffX / len;
        let dirY = diffY / len;
        let amount = len / 4;
        let time = (new Date().getTime() % 300) / 300;
        sx += diffX / amount * time;
        sy += diffY / amount * time;
        for (let i = 0; i <= amount - 1; i++) {
            screen.moveTo(sx + dirY, sy - dirX);
            screen.lineTo(sx + 3 * dirX, sy + 3 * dirY);
            screen.lineTo(sx - dirY, sy + dirX);
            sx += diffX / amount;
            sy += diffY / amount;
        }
    }
    function findAt(x, y) {
        for (let i = all.length - 1; i >= 0; i--) {
            if (all[i].inside(x, y)) {
                return all[i];
            }
        }
        return null;
    }
    graph.findAt = findAt;
    function remove(x) {
        for (let i = 0; i < all.length; i++) {
            if (all[i] == x) {
                all.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < all.length; i++) {
            let idx = all[i].inputs.indexOf(x);
            if (idx >= 0) {
                all[i].inputs.splice(idx, 1);
            }
        }
    }
    graph.remove = remove;
    function moveTo(c, x, y) {
        if (c.length == 0) {
            return;
        }
        let dX = x - c[c.length - 1].x;
        let dY = y - c[c.length - 1].y;
        for (let i = 0; i < c.length; i++) {
            c[i].move(dX, dY);
        }
    }
    graph.moveTo = moveTo;
    function moveAll(dx, dy) {
        for (let i = 0; i < all.length; i++) {
            all[i].move(dx, dy);
        }
    }
    graph.moveAll = moveAll;
    function move(x, y, c) {
        if (c.length == 0) {
            for (let i = 0; i < all.length; i++) {
                all[i].move(-x, -y);
            }
        }
        else {
            for (let i = 0; i < c.length; i++) {
                c[i].move(x, y);
            }
        }
    }
    graph.move = move;
    function createMatrixShader(mat, forcePositive) {
        let res = `precision mediump float;
	varying vec2 uv;
	uniform sampler2D texture;
	uniform vec2 size;
	
	void main() {
		vec3 res = vec3(0.0, 0.0, 0.0);
	`;
        let max = 0;
        let min = 0;
        let l = mat.length;
        let l2 = Math.floor(l / 2);
        for (let i = 0; i < l; i++) {
            for (let j = 0; j < l; j++) {
                let val = mat[i][j];
                if (val == 0) {
                    continue;
                }
                res += ("res += texture2D(texture, uv + vec2(" +
                    (i - l2).toFixed(1) + ", " + (j - l2).toFixed(1) +
                    ") / size).rgb * " + val.toFixed(1) + ";");
                if (val < 0 && !forcePositive) {
                    min += val;
                }
                else {
                    max += val;
                }
            }
        }
        res += "gl_FragColor.rgb = (res + " + (-min).toFixed(1) + ") / " + (max - min).toFixed(1) + ";";
        res += "gl_FragColor.a = 1.0;}";
        return res;
    }
})(graph || (graph = {}));
