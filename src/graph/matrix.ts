import * as Box from './box.js'
import * as Graph from './graph.js'
import * as GPU from '../gpu/gpu.js'
import * as Texture from '../gpu/texture.js'

let compute: GPU.Compute
export async function Setup() {
	compute = await GPU.NewCompute("../shaders/matrix.wgsl")
}

export class Matrix extends Box.Box {

	negative: boolean
	data: number[][]
	buffer: GPUBuffer
	table: HTMLTableElement

	constructor() {
		super(250, 250, 1)
		this.data = [
			[-1, 0, 1],
			[-2, 0, 2],
			[-1, 0, 1],
		]
		this.negative = true
		this.buffer = this.updateBuffer()
		let top = document.createElement("div")
		top.className = "top"
		this.body.append(top)
		this.table = document.createElement("table")
		this.body.append(this.table)

		let decrease = document.createElement("button")
		decrease.onclick = async () => {
			if (this.data.length > 1) {
				this.data.pop()
				for (let i = 0; i < this.data.length; i++) {
					this.data[i].pop()
				}
				this.buffer = this.updateBuffer()
				this.updateTable()
				GPU.Start()
				this.recursiveReset()
				await this.recursiveUpdate()
				GPU.End()
			}
		}
		decrease.innerText = "-"
		top.append(decrease)

		let shift = document.createElement("button")
		shift.onclick = async () => {
			this.negative = !this.negative
			this.buffer = this.updateBuffer()
			GPU.Start()
			this.recursiveReset()
			await this.recursiveUpdate()
			GPU.End()
		}
		shift.innerText = "~"
		shift.title = (
			"Toggle normalization between (min -> 0 | max -> 1) and (0 -> 0 | <max+min> -> 1)\n" +
			"min: sum of negative values\n" +
			"max: sum of positive values"
		)
		top.append(shift)
		let increase = document.createElement("button")
		increase.onclick = async () => {
			let row = []
			for (let i = 0; i < this.data.length; i++) {
				this.data[i].push(0)
				row.push(0)
			}
			row.push(0)
			this.data.push(row)
			this.buffer = this.updateBuffer()
			this.updateTable()
			GPU.Start()
			this.recursiveReset()
			await this.recursiveUpdate()
			GPU.End()
		}
		increase.innerText = "+"
		top.append(increase)

		this.updateTable()
	}

	async Setup() {
		this.result = await Texture.Blanc(1, 1)
		this.moveBy(0, 0)
		Graph.AddBox(this)
	}

	updateTable() {
		this.table.innerHTML = ""
		for (let i = 0; i < this.data.length; i++) {
			let row = document.createElement("tr")
			for (let j = 0; j < this.data.length; j++) {
				let cell = document.createElement("td")
				cell.innerText = this.data[i][j].toString()
				cell.onclick = (ev) => {
					ev.stopPropagation()
					let area = document.createElement("div")
					area.className = "popArea"
					document.body.appendChild(area)

					let scroll = document.createElement("scroll")
					scroll.className = "scroll"
					area.append(scroll)

					let div = document.createElement("div")
					div.className = "shader"
					let bot = document.createElement("div")
					bot.className = "bot"
					let input = document.createElement("input")
					input.type = "range"
					let number = document.createElement("div")
					number.className = "number"
					input.min = "-10"
					input.step = "0.1"
					input.max = "10"
					input.value = cell.innerText
					number.innerText = input.value
					div.append(bot)
					bot.append(input)
					bot.append(number)
					scroll.append(div)
					input.onchange = (ev) => {
						number.innerText = input.value
						ev.stopPropagation()
					}
					input.focus()
					div.onclick = (ev) => { ev.stopPropagation() }
					area.onclick = async () => {
						area.remove()
						cell.innerText = input.value
						this.data[i][j] = parseFloat(input.value)
						this.buffer = this.updateBuffer()
						GPU.Start()
						this.recursiveReset()
						await this.recursiveUpdate()
						GPU.End()
					}
				}
				row.append(cell)
			}
			this.table.append(row)
		}
	}

	async update() {
		if (this.inputs.length == 1) {
			let input = this.inputs[0].start
			if (input.result.width == 1 && input.result.height == 1) {
				return
			}
			if (input.result.width != this.result.width || input.result.height != this.result.height) {
				this.result = await Texture.Blanc(input.result.width, input.result.height)
			}
			compute.Calculate([input.result], this.buffer, this.result)
		}
	}

	updateBuffer(): GPUBuffer {
		let floats = new Float32Array(3 + this.data.length * this.data.length)
		let min = 0
		let max = 0
		for (let i = 0; i < this.data.length; i++) {
			for (let j = 0; j < this.data.length; j++) {
				if (this.negative && this.data[i][j] < 0) {
					min += this.data[i][j]
				} else {
					max += this.data[i][j]
				}
			}
		}
		floats.set([this.data.length, min, max], 0)
		for (let i = 0; i < this.data.length; i++) {
			floats.set(this.data[i], 3 + i * this.data.length)
		}
		return GPU.CreateBuffer(floats, GPUBufferUsage.STORAGE)
	}
}
