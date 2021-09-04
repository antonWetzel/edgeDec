import * as Graph from './graph/graph.js'
import * as Webcam from './graph/webcam.js'
import * as File from './graph/file.js'
import * as Shader from './graph/shader.js'
import * as Matrix from './graph/matrix.js'
import * as Display from './graph/display.js'
import * as Template from './graph/template.js'

import * as GPU from './gpu/gpu.js'

document.body.onload = async () => {

	let area = document.getElementById("area") as HTMLCanvasElement

	let setupButton = (id: string, cb: () => void) => {
		let x = document.getElementById(id + "Button") as HTMLButtonElement
		if (x == null) {
			alert("id problem")
			return
		}
		x.onclick = cb
	}

	setupButton("file", File.New)
	setupButton("display", Display.New)
	setupButton("shader", Shader.New)
	setupButton("matrix", Matrix.New)
	setupButton("webcam", Webcam.New)
	setupButton("template", Template.New)

	await GPU.Setup()
	Graph.Setup(area)
}
