import * as Box from './box.js'
import * as GPU from '../gpu/gpu.js'
import * as Texture from '../gpu/texture.js'
import * as Request from '../helper/request.js'
import * as Graph from './graph.js'

type Paramter = {
	name: string,
	min: number,
	step: number,
	max: number
}
type ShaderInfo = {
	inputs: number,
	tooltip: string,
	parameter: Paramter[]
}
let infos: { [key: string]: ShaderInfo }

export async function Setup() {
	infos = JSON.parse(await Request.getFile("../shaders/infos.json"))
}

export class Shader extends Box.Box {

	compute: GPU.Compute
	buffer: GPUBuffer | null

	constructor() {
		super(250, 250, 0)
		this.compute = undefined as any
		this.buffer = null
	}

	async Setup(name: string) {
		let info = infos[name]
		this.compute = await GPU.NewCompute("../shaders/" + name + ".wgsl")
		let body = document.createElement("div")
		body.className = "shader"
		body.innerHTML = name
		this.maxInputs = info.inputs
		this.body.append(body)

		this.result = await Texture.Blanc(1, 1)

		let parameter: number[]
		if (info.parameter.length > 0) {
			parameter = []
			for (let i = 0; i < info.parameter.length; i++) {
				parameter.push(info.parameter[i].min)
			}
			this.buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM)
		}

		this.body.onclick = (ev) => {
			ev.stopPropagation()
			if (info.parameter.length > 0) {
				let area = document.createElement("div")
				area.className = "popArea"
				document.body.appendChild(area)

				let scroll = document.createElement("scroll")
				scroll.className = "scroll"
				area.append(scroll)

				for (let i = 0; i < info.parameter.length; i++) {
					let param = info.parameter[i]
					let div = document.createElement("div")
					let name = document.createElement("div")
					div.className = "shader"
					name.className = "name"
					name.innerText = param.name
					div.append(name)
					let bot = document.createElement("div")
					bot.className = "bot"
					let input = document.createElement("input")
					input.type = "range"
					let number = document.createElement("div")
					number.className = "number"
					input.min = param.min.toString()
					input.step = param.step.toString()
					input.max = param.max.toString()
					input.value = parameter[i].toString()
					number.innerText = input.value
					div.append(bot)
					bot.append(input)
					bot.append(number)
					input.onchange = () => {
						parameter[i] = parseFloat(input.value)
						number.innerText = input.value
					}
					div.onclick = (ev) => { ev.stopPropagation() }
					scroll.appendChild(div)
				}

				area.onclick = async () => {
					area.remove()
					this.buffer = GPU.CreateBuffer(new Float32Array(parameter), GPUBufferUsage.UNIFORM)
					this.recursiveReset()
					GPU.Start()
					await this.recursiveUpdate()
					GPU.End()
				}
			}
		}
		this.moveBy(0, 0)
		Graph.AddBox(this)
	}

	async update() {
		if (this.inputs.length != this.maxInputs) {
			return
		}
		let inputs: GPU.Texture[] = []
		for (let i = 0; i < this.inputs.length; i++) {
			let result = this.inputs[i].start.result
			if (result.width == 1 && result.height == 1) {
				return
			}
			inputs.push(result)
		}
		if (this.result.width != inputs[0].width || this.result.height != inputs[0].height) {
			this.result = await Texture.Blanc(inputs[0].width, inputs[0].height)
		}
		this.compute.Calculate(inputs, this.buffer, this.result)
	}
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
		let button = document.createElement("button")
		let name = document.createElement("div")
		name.className = "name"
		name.innerText = key
		button.append(name)
		let tooltip = document.createElement("div")
		tooltip.className = "tooltip"
		tooltip.innerText = infos[key].tooltip
		button.append(tooltip)
		scroll.appendChild(button)

		button.onclick = async (ev) => {
			let shader = new Shader()
			await shader.Setup(key)
		}
	}
}
