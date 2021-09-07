import * as Box from './box.js'
import * as Shader from './shader.js'
import * as Matrix from './matrix.js'
import * as Template from './template.js'

export let field: HTMLElement
let trash: HTMLElement
let area: HTMLElement
export let inTrash: boolean
export let svg: SVGSVGElement

let start: { x: number, y: number }
let all: Box.Box[]

export async function Setup(): Promise<void> {

	svg = document.getElementById("svg") as any
	field = document.getElementById("field") as any
	trash = document.getElementById("trash") as any
	area = trash.parentElement as HTMLElement
	HideTrash()
	all = []
	start = { x: 0, y: 0 }
	inTrash = false

	field.draggable = true

	let started = false

	field.ondragstart = (ev) => {
		let img = document.createElement("img");
		if (ev.dataTransfer != null) {
			ev.dataTransfer.setDragImage(img, 0, 0);
		}
		start = { x: ev.pageX - field.offsetLeft, y: ev.pageY - field.offsetTop }
		started = true
	}

	field.ondrag = async (ev) => {
		ev.stopPropagation()
		if (!ev.ctrlKey) {
			if (ev.clientX == 0 && ev.clientY == 0) {
				return
			}
			if (started) { //first frame uses the div position, skip it
				started = false
				return
			}
			let x = ev.pageX - field.offsetLeft
			let y = ev.pageY - field.offsetTop
			let dx = x - start.x
			let dy = y - start.y
			start = { x: x, y: y }
			for (let i = 0; i < all.length; i++) {
				all[i].moveBy(dx, dy)
			}
		}
	}
	trash.ondragenter = (ev) => {
		inTrash = true
	}
	trash.ondragleave = (ev) => {
		setTimeout(() => { inTrash = false }, 1)
	}

	await Shader.Setup()
	await Matrix.Setup()
	await Template.Setup()
}

export function AddBox(box: Box.Box) {
	all.push(box)
	field.append(box.body)
}

export function RemoveBox(box: Box.Box) {
	let idx = all.indexOf(box)
	all.splice(idx, 1)
	field.removeChild(box.body)
}

export function ShowTrash() {
	area.append(trash)
}

export function HideTrash() {
	trash.remove()
}

