import * as Box from './box.js'
import * as Request from '../helper/request.js'
import * as Shader from './shader.js'
import * as Graph from './graph.js'

type TemplateInfo = {
	tooltip: string,
}
let infos: { [key: string]: TemplateInfo }

type Shader = {
	category: string,
	name: string,
	inputs: number[]
}
type Template = Shader[]

export async function Setup() {
	infos = JSON.parse(await Request.getFile("../templates/info.json"))
}

export async function New(): Promise<void> {
	let area = document.createElement("div")
	area.className = "popArea"
	document.body.appendChild(area)

	let scroll = document.createElement("scroll")
	scroll.className = "scroll"
	area.append(scroll)

	area.onclick = async () => {
		area.remove()
	}

	for (let key in infos) {
		let info = infos[key]
		let button = document.createElement("div")
		button.className = "button"
		let name = document.createElement("div")
		name.className = "name"
		name.innerText = key
		button.append(name)
		let tooltip = document.createElement("div")
		tooltip.className = "tooltip"
		tooltip.innerText = info.tooltip
		button.append(tooltip)
		scroll.appendChild(button)

		button.onclick = async (ev) => {
			let template = JSON.parse(await Request.getFile("../templates/" + key + ".json")) as Template
			let boxes: Box.Box[] = []
			for (let i = 0; i < template.length; i++) {
				let info = template[i]
				let box = new Shader.Shader()
				box.Setup(info.category, info.name)
				for (let i = 0; i < info.inputs.length; i++) {
					let line = new Box.Line(boxes[info.inputs[i]])
					line.end = box
					boxes[info.inputs[i]].outputs.push(line)
					box.inputs.push(line)
				}
				boxes.push(box)
			}
			for (let i = 0; i < boxes.length; i++) {
				let box = boxes[i]
				let x = box.x
				for (let i = 0; i < box.inputs.length; i++) {
					let start = box.inputs[i].start
					x = Math.max(x, start.x + 250)
				}
				await box.moveTo(x, 200)
			}
			let counts: { [key: number]: number } = {}
			let proms = []
			for (let i = 0; i < boxes.length; i++) {
				let box = boxes[i]
				let x = box.x
				let y = counts[x]
				if (y == undefined) {
					counts[x] = 1
					y = 0
				} else {
					counts[x] = y + 1
				}
				proms.push(box.moveBy(0, y * 100))
			}
			for (let i = 0; i < proms.length; i++) {
				await proms[i]
			}
		}
	}
}
