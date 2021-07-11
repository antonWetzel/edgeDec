"use strict";
/**logic and display of the graph area*/
var graph;
(function (graph) {
    /**fontheight for the canvas and the sidebar*/
    graph.fontHeight = 30;
    /**
     * webGL is 3d and calculates positions from -1 to +1
     *
     * normalize uv from 0 to 1 and don't change the positions
    */
    const vertexShaderData = `
	attribute vec2 position;
	varying vec2 uv;
		
	void main() {
		uv = position/2.0 + 0.5;
		gl_Position = vec4(position.x, position.y, 0.0, 1.0);
	}`;
    /**result area, visible to the user*/
    let screen;
    /**remember all drawables to iterate*/
    let all;
    /**webGl context for calculations, the same context for all drawables*/
    let gl;
    /**defautl webGLProgramm for displays*/
    let nothingProgram;
    /**border width around drawables*/
    const border = 5;
    /**
     * baseclass for all drawables, manages inputs, movabiltiy, size
     *
     * default methods to fill with text or image
    */
    class drawable {
        constructor(l, //expected input cound
        w, h, //display size
        result, //result texture
        resultW, resultH //result size
        ) {
            this.x = screen.canvas.width * 1 / 6 + w;
            this.y = screen.canvas.height * 1 / 6 + h;
            this.w = w;
            this.h = h;
            this.inputs = [];
            this.result = result;
            this.selected = false;
            this.l = l;
            this.resultW = resultW;
            this.resultH = resultH;
        }
        /** add one input, may remove oldest input if the expected input count is reached */
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
        /** change the display size */
        zoom(dist) {
            let mult = 1 - dist / 1000;
            this.w *= mult;
            this.h *= mult;
        }
        /** draw outer box and update the inside */
        draw() {
            if (this.selected) {
                this.drawRect(color.boxSelected, true);
            }
            else {
                this.drawRect(color.boxNormal, true);
            }
            this.drawRect(color.boxBackground, false);
            this.update();
        }
        /** true if the coordinates are inside */
        inside(x, y) {
            return (this.x - this.w <= x && x < this.x + this.w &&
                this.y - this.h <= y && y < this.y + this.h);
        }
        /** move relative to the current position */
        move(x, y) {
            this.x += x;
            this.y += y;
        }
        /** move to the coordinates */
        moveAbs(x, y) {
            this.x = x;
            this.y = y;
        }
        /** draw an image inside the drawable */
        drawImage(img) {
            screen.drawImage(img, this.x - this.w, this.y - this.h, this.w * 2, this.h * 2);
        }
        /** draw a rectangle with or without the border */
        drawRect(color, full) {
            screen.fillStyle = color;
            if (full) {
                screen.fillRect(this.x - this.w - border, this.y - this.h - border, (this.w + border) * 2, (this.h + border) * 2);
            }
            else {
                screen.fillRect(this.x - this.w, this.y - this.h, this.w * 2, this.h * 2);
            }
        }
        /** draw text at the center */
        drawText(text) {
            screen.fillStyle = color.text;
            let s = text.split("\n");
            for (let i = 0; i < s.length; i++) {
                screen.fillText(s[i], this.x, this.y + (i - s.length / 2 + 0.5) * graph.fontHeight);
            }
        }
    }
    graph.drawable = drawable;
    /** source from a video (webcam or file) */
    class VideoSource extends drawable {
        constructor(vid) {
            vid.width = vid.videoWidth;
            vid.height = vid.videoHeight;
            super(0, vid.width / 2, vid.height / 2, createTexture(vid), vid.width, vid.height);
            this.vid = vid;
        }
        get helptext() {
            return "Video Source\n" +
                "   m: toggle sound\n" +
                "   a: decrease output size\n" +
                "   d: increase output size\n" +
                "   mouse wheel: change display size";
        }
        update() {
            gl.bindTexture(gl.TEXTURE_2D, this.result);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.vid);
            this.drawImage(this.vid);
        }
        edit(key) {
            if (key == "m") {
                this.vid.volume = 1 - this.vid.volume;
            }
            else if (key == 'a') {
                this.resultH /= 1.1;
                this.resultW /= 1.1;
                this.w /= 1.1;
                this.h /= 1.1;
            }
            else if (key == 'd') {
                this.resultH *= 1.1;
                this.resultW *= 1.1;
                this.w *= 1.1;
                this.h *= 1.1;
            }
        }
    }
    /** source from a image (file) */
    class ImageSource extends drawable {
        constructor(img) {
            super(0, img.width / 2, img.height / 2, createTexture(img), img.width, img.height);
            this.img = img;
        }
        update() {
            this.drawImage(this.img);
        }
        get helptext() {
            return "Image Source\n" +
                "   a: decrease output size\n" +
                "   d: increase output size\n" +
                "   mouse wheel: change display size";
        }
        edit(key) {
            if (key == 'a') {
                this.resultH /= 1.1;
                this.resultW /= 1.1;
                this.w /= 1.1;
                this.h /= 1.1;
            }
            else if (key == 'd') {
                this.resultH *= 1.1;
                this.resultW *= 1.1;
                this.w *= 1.1;
                this.h *= 1.1;
            }
        }
    }
    /** copy input and display it */
    class Display extends drawable {
        constructor() {
            super(1, 100, 100, createTexture(gl.canvas), 200, 200);
        }
        update() {
            if (this.inputs.length == 0) {
                return;
            }
            gl.useProgram(nothingProgram);
            let input = this.inputs[0];
            let update = false;
            if (this.resultW != input.resultW) {
                this.resultW = input.resultW;
                this.w = input.resultW / 2;
                update = true;
            }
            if (this.resultH != input.resultH) {
                this.resultH = input.resultH;
                this.h = input.resultH / 2;
                update = true;
            }
            if (gl.canvas.width != input.resultW) {
                gl.canvas.width = input.resultW;
                update = true;
            }
            if (gl.canvas.height != input.resultH) {
                gl.canvas.height = input.resultH;
                update = true;
            }
            if (update) {
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }
            gl.activeTexture(gl.TEXTURE0);
            let loc = gl.getUniformLocation(nothingProgram, "texture");
            if (loc != null) {
                gl.uniform1i(loc, 0);
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, input.result);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.finish();
            gl.bindTexture(gl.TEXTURE_2D, this.result);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, gl.canvas);
            this.drawImage(gl.canvas);
        }
        edit(key) {
            if (key == 'h') {
                let link = document.createElement('a');
                link.download = 'display.png';
                this.update();
                link.href = gl.canvas.toDataURL();
                link.click();
            }
        }
        get helptext() {
            return "Image Source\n" +
                "   h: save display\n";
        }
    }
    /** calculates result with webGL  */
    class Operator extends drawable {
        constructor(l, w, h, program) {
            super(l, w, h, createTexture(gl.canvas), 200, 200);
            this.program = program;
            this.displayName = "";
        }
        update() {
            this.drawText(this.displayName);
            if (this.inputs.length == 0) {
                return;
            }
            gl.useProgram(this.program);
            let input = this.inputs[0];
            let update = false;
            if (this.resultW != input.resultW) {
                this.resultW = input.resultW;
                update = true;
            }
            if (this.resultH != input.resultH) {
                this.resultH = input.resultH;
                update = true;
            }
            if (gl.canvas.width != input.resultW) {
                gl.canvas.width = input.resultW;
                update = true;
            }
            if (gl.canvas.height != input.resultH) {
                gl.canvas.height = input.resultH;
                update = true;
            }
            if (update) {
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                let size = gl.getUniformLocation(this.program, "size");
                if (size != null) {
                    gl.uniform2f(size, gl.canvas.width, gl.canvas.height);
                }
            }
            for (let i = 0; i < this.inputs.length; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                let loc = gl.getUniformLocation(this.program, "texture" + i.toString());
                if (loc != null) {
                    gl.uniform1i(loc, i);
                }
                gl.bindTexture(gl.TEXTURE_2D, this.inputs[i].result);
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.finish();
            gl.bindTexture(gl.TEXTURE_2D, this.result);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, gl.canvas);
        }
        zoom(_dist) {
            //pass
        }
    }
    /** operator with predifined shader */
    class ShaderOperator extends Operator {
        constructor(l, name, program, param, values) {
            super(l, 0, graph.fontHeight * param.length / 2 + 20, program);
            this.name = name;
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
                s += this.param[i] + ": " + this.values[i].toFixed(3);
                if (i == this.index) {
                    s += "<";
                }
                w = Math.max(w, screen.measureText(s).width);
                this.displayName += "\n" + s;
            }
            this.w = w / 2 + 20;
        }
        edit(key) {
            if (key == 'h') {
                let link = document.createElement('a');
                link.download = this.name + ".png";
                this.update();
                link.href = gl.canvas.toDataURL();
                link.click();
            }
            else if (this.param.length == 0) {
                return;
            }
            else if (key == "w" || key == "s") {
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
                        x = -1 / 250;
                        break;
                    case "a":
                        x = -10 / 250;
                        break;
                    case "e":
                        x = 1 / 250;
                        break;
                    case "d":
                        x = 10 / 250;
                }
                this.values[this.index] += x;
                if (this.values[this.index] < 0) {
                    this.values[this.index] = 0;
                }
                if (this.values[this.index] > 1) {
                    this.values[this.index] = 1;
                }
                gl.useProgram(this.program);
                let loc = gl.getUniformLocation(this.program, this.param[this.index]);
                if (loc != null) {
                    gl.uniform1f(loc, this.values[this.index]);
                }
                this.updateName();
            }
        }
        get helptext() {
            return "Shader Operator\n" +
                "   h: save result\n" +
                "   w,s: change selected parameter\n" +
                "   q,a: reduce parameter\n" +
                "   e,d: increase parameter\n";
        }
    }
    /** operator with shader based on the matrix */
    class MatrixOperator extends Operator {
        constructor(program, mat) {
            super(1, 100, 100, program);
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
            this.h = this.values.length * graph.fontHeight;
        }
        edit(key) {
            switch (key) {
                case 'h':
                    let link = document.createElement('a');
                    link.download = 'matrix.png';
                    this.update();
                    link.href = gl.canvas.toDataURL();
                    link.click();
                    break;
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
                    let x = createWebGlProgram(createMatrixShader(this.values, this.force));
                    if (x == null) {
                        console.log("error in matrix shader creator");
                        return;
                    }
                    gl.deleteProgram(this.program);
                    this.program = x.program;
                    gl.useProgram(x.program);
                    let size = gl.getUniformLocation(this.program, "size");
                    if (size != null) {
                        gl.uniform2f(size, this.resultW, this.resultH);
                    }
                    break;
                default:
                    return;
            }
            this.updateName();
        }
        get helptext() {
            return "Shader Operator\n" +
                "   h: save display\n" +
                "   w,a,s,d: change position\n" +
                "   q: reduce position\n" +
                "   e: increase position\n" +
                "   r: toggle negative scaling\n" +
                "   f: reduce matrix size\n" +
                "   g: increase matrix size\n";
        }
    }
    /** setup webGL and start the draw loop */
    function setup(ctx) {
        screen = ctx;
        all = [];
        let calc = document.createElement("canvas");
        let glt = calc.getContext("webgl");
        if (glt == null) {
            console.log("context not found");
            return;
        }
        gl = glt;
        let x = createWebGlProgram(shaders.all["nothing"]);
        if (x == null) {
            console.log("error with nothing program");
            return;
        }
        nothingProgram = x.program;
        setInterval(draw, 1000 / 30);
    }
    graph.setup = setup;
    /** add operator based on a matrix */
    function addCustomOperator() {
        let mat = [[1, 1], [-1, -1]];
        let x = createOperator(createMatrixShader(mat, false), "", mat);
        if (x != null) {
            all.push(x);
        }
        return x;
    }
    graph.addCustomOperator = addCustomOperator;
    /** add operator based on predifined program */
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
    /** helper function to setup the webGL program */
    function createWebGlProgram(programData) {
        //check the program source for uniforms
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
        //setup the shader in webGL
        let program = gl.createProgram();
        if (program == null) {
            console.log("could not create program");
            return null;
        }
        let datas = [vertexShaderData, programData];
        let types = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
        for (let i = 0; i < datas.length; i++) {
            let shader = gl.createShader(types[i]);
            if (shader == null) {
                console.log("could not create shader");
                return null;
            }
            gl.shaderSource(shader, datas[i]);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
            return null;
        }
        //setup the 3D triangles
        const buffer = gl.createBuffer();
        if (buffer == null) {
            console.log("could not create buffer");
            return null;
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
        return { "program": program, "texCount": texCount, "param": param };
    }
    /** helper function to setup operator */
    function createOperator(programData, name, matrix = null) {
        let x = createWebGlProgram(programData);
        if (x == null) {
            return null;
        }
        let values = [];
        for (let i = 0; i < x.param.length; i++) {
            values.push(0);
        }
        if (matrix != null) {
            return new MatrixOperator(x.program, matrix);
        }
        else {
            return new ShaderOperator(x.texCount, name, x.program, x.param, values);
        }
    }
    /** add a source based on a webcam */
    async function addWebcam() {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        catch {
            alert("could not create webcam input");
        }
        finally {
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
    }
    graph.addWebcam = addWebcam;
    /** add a source based on a file */
    async function addFile() {
        return new Promise(function (resolve, recect) {
            let input = document.createElement("input");
            input.type = "file";
            input.onchange = function () {
                let files = input.files;
                if (files == null || files.length == 0) {
                    recect("only one file allowed");
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
                        alert("file format not allowed");
                }
            };
            input.click();
        });
    }
    graph.addFile = addFile;
    /** add display to the display area */
    function addDisplay() {
        let dis = new Display();
        all.push(dis);
        return dis;
    }
    graph.addDisplay = addDisplay;
    /** redraw the display */
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
            all[i].draw();
        }
    }
    /** draw arrow betwenn to drawables */
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
    /** return drawable at the coordinates */
    function findAt(x, y) {
        for (let i = all.length - 1; i >= 0; i--) {
            if (all[i].inside(x, y)) {
                return all[i];
            }
        }
        return null;
    }
    graph.findAt = findAt;
    /** return drawable and connections */
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
    /** move operator to the coordinates, other drawables are moved by the same distance */
    function moveTo(c, x, y) {
        if (c.length == 0) {
            //pass//
        }
        else if (c.length == 1) { //try to allign if only one	is moved
            for (let i = 0; i < all.length; i++) {
                if (Math.abs(all[i].x - x) < 10) {
                    x = all[i].x;
                    break;
                }
            }
            for (let i = 0; i < all.length; i++) {
                if (Math.abs(all[i].y - y) < 10) {
                    y = all[i].y;
                    break;
                }
            }
            c[0].moveAbs(x, y);
        }
        else { //move all by the difference to the first
            let dX = x - c[0].x;
            let dY = y - c[0].y;
            for (let i = 0; i < c.length; i++) {
                c[i].move(dX, dY);
            }
        }
    }
    graph.moveTo = moveTo;
    /** move all operators by the distance */
    function moveAll(dx, dy) {
        for (let i = 0; i < all.length; i++) {
            all[i].move(dx, dy);
        }
    }
    graph.moveAll = moveAll;
    /** move selected operators by the distance */
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
    /** create shader based on the matrix */
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
    /** create and setup webGL texture */
    function createTexture(src) {
        let texture = gl.createTexture();
        if (texture == null) {
            console.log("texture error");
            return 0;
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
    }
})(graph || (graph = {}));
