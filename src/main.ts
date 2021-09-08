import * as Graph from './graph/graph.js'
import * as Source from './graph/source.js'
import * as Shader from './graph/shader.js'
import * as Matrix from './graph/matrix.js'
import * as Display from './graph/display.js'
import * as Template from './graph/template.js'

import * as GPU from './gpu/gpu.js'

document.body.onload = async () => {

	let setupButton = (id: string, cb: () => void) => {
		let x = document.getElementById(id + "Button") as HTMLButtonElement
		if (x == null) {
			alert("id problem")
			return
		}
		x.onclick = cb
	}

	setupButton("webcam", () => { Source.Webcam() })
	setupButton("file", () => { Source.File() })
	setupButton("shader", () => { Shader.New() })
	setupButton("matrix", () => { new Matrix.Matrix().Setup() })
	setupButton("custom", () => { Shader.Custom() })
	setupButton("display", () => { new Display.Display().Setup() })
	setupButton("template", () => { Template.New() })

	try {
		await GPU.Setup()
	} catch {
		document.body.innerHTML = ""
		let error = document.createElement("div")
		error.id = "error"
		error.innerText = "Problem with WebGPU"
		document.body.append(error)
		return
	}

	await Graph.Setup()
	await Shader.Setup()
	await Matrix.Setup()
	await Template.Setup()

	let mode = document.cookie;
	if (mode != "light" && mode != "dark") {
		mode = "light"
	}
	document.body.onkeydown = (ev) => {
		if (ev.code == "KeyC") {
			mode = (mode == "light") ? "dark" : "light"
			setStylesheet(mode)
		}
	}
	setStylesheet(mode)
}

function setStylesheet(mode: string) {
	let sheet = document.getElementById("color") as HTMLLinkElement
	sheet.href = "../css/" + mode + ".css"
	let date = new Date()
	date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * 7) //valid for one week
	document.cookie = mode + "; expires=" + date.toUTCString()
}
