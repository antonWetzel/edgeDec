import * as Box from './box.js'
import * as Shader from './shader.js'
import * as Matrix from './matrix.js'
import * as Template from './template.js'

export let area: HTMLElement
export let thrash: HTMLElement
export let svg: SVGSVGElement

let start: { x: number, y: number }
let all: Box.Box[]

export async function Setup(container: HTMLElement): Promise<void> {
	area = container
	svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	area.append(svg)

	all = []
	start = { x: 0, y: 0 }

	thrash = document.createElement("div")
	thrash.className = "thrash"
	thrash.style.display = "none"
	area.append(thrash)

	area.draggable = true

	let started = false

	area.ondragstart = (ev) => {
		let img = document.createElement("img");
		if (ev.dataTransfer != null) {
			ev.dataTransfer.setDragImage(img, 0, 0);
		}
		start = { x: ev.pageX - area.offsetLeft, y: ev.pageY - area.offsetTop }
		started = true
	}

	area.ondrag = async (ev) => {
		ev.stopPropagation()
		if (!ev.ctrlKey) {
			if (ev.clientX == 0 && ev.clientY == 0) {
				return
			}
			if (started) { //first frame uses the div position, skip it
				started = false
				return
			}
			let x = ev.pageX - area.offsetLeft
			let y = ev.pageY - area.offsetTop
			let dx = x - start.x
			let dy = y - start.y
			start = { x: x, y: y }
			let proms = []
			for (let i = 0; i < all.length; i++) {
				let box = all[i]
				proms.push(box.moveBy(dx, dy))
			}
			for (let i = 0; i < proms.length; i++) {
				await proms[i]
			}
		}
	}
	await Shader.Setup()
	await Matrix.Setup()
	await Template.Setup()
}

export function AddBox(box: Box.Box) {
	all.push(box)
	area.append(box.body)
}

export function RemoveBox(box: Box.Box) {
	let idx = all.indexOf(box)
	all.splice(idx, 1)
	area.removeChild(box.body)
}
