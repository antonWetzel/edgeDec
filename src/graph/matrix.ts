import * as Box from './box.js'
import * as Graph from './graph.js'
import * as GPU from '../gpu/gpu.js'
import * as Texture from '../gpu/texture.js'

let compute: GPU.Compute
export async function Setup() {
	compute = await GPU.NewCompute("../shaders/matrix.wgsl")
}
export async function New(): Promise<void> {
	let b = Box.New(100, 100, 1)


	let data = [
		[-1, 0, 0],
		[-2, 0, 0],
		[1, 0, 0],
	]

	let buffer: GPUBuffer
	let negative = false
	let updateBuffer = () => {
		let floats = new Float32Array(3 + data.length * data.length)
		let min = 0
		let max = 0
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data.length; j++) {
				if (negative && data[i][j] < 0) {
					min += data[i][j]
				} else {
					max += data[i][j]
				}
			}
		}
		floats.set([data.length, min, max], 0)
		for (let i = 0; i < data.length; i++) {
			floats.set(data[i], 3 + i * data.length)
		}
		buffer = GPU.CreateBuffer(floats, GPUBufferUsage.STORAGE)
	}
	updateBuffer()
	let top = document.createElement("div")
	top.className = "top"
	b.append(top)
	let table = document.createElement("table")
	b.append(table)
	let updateTable = () => {
		table.innerHTML = ""
		for (let i = 0; i < data.length; i++) {
			let row = document.createElement("tr")
			for (let j = 0; j < data.length; j++) {
				let cell = document.createElement("td")
				cell.innerText = data[i][j].toString()
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
						data[i][j] = parseFloat(input.value)
						updateBuffer()
					}
				}
				row.append(cell)
			}
			table.append(row)
		}
	}
	updateTable()

	let decrease = document.createElement("button")
	decrease.onclick = () => {
		if (data.length > 1) {
			data.pop()
			for (let i = 0; i < data.length; i++) {
				data[i].pop()
			}
			updateBuffer()
			updateTable()
		}
	}
	decrease.innerText = "-"
	top.append(decrease)

	let shift = document.createElement("button")
	shift.onclick = () => {
		negative = !negative
		updateBuffer()
	}
	shift.innerText = "~"
	top.append(shift)
	let increase = document.createElement("button")
	increase.onclick = () => {
		let row = []
		for (let i = 0; i < data.length; i++) {
			data[i].push(0)
			row.push(0)
		}
		row.push(0)
		data.push(row)
		updateBuffer()
		updateTable()
	}
	increase.innerText = "+"
	top.append(increase)

	b.result = await Texture.Blanc(1, 1)

	b.update = async () => {
		if (b.inputs.length == 1) {
			let input = b.inputs[0].start
			if (input.result.width == 1 && input.result.height == 1) {
				return
			}
			if (input.result.width != b.result.width || input.result.height != b.result.height) {
				b.result = await Texture.Blanc(input.result.width, input.result.height)
			}
			compute.Calculate([input.result], buffer, b.result)
		}
	}
}
