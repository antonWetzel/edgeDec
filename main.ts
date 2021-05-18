
document.body.onload = function() {
	graph.setup()
	selected = []
}

function resetSelected(x: graph.drawable | null = null) {
	for (let i = 0; i < selected.length; i++) {
		selected[i].selected = false
	}
	if (x != null) {
		x.selected = true
		selected = [x]
	} else {
		selected = []
	}
} 

document.body.onkeydown = async function(ev: KeyboardEvent) {
	let x: graph.drawable | null = null
	let key = ev.key.toLowerCase()
	switch (key) {
	case "1":
		x = await graph.addWebcam()
		break
	case "2":
		x = await graph.addFile()
		break
	case "3":
		x = addOperator()
		break
	case "4":
		x = graph.addCustomOperator()
		break
	case "5":
		x = graph.addDisplay()
		break
	case "6":
		addTemplate()
		break
	case "7":
		color.advance()
		break
	case "delete":
		for (let i = 0; i < selected.length; i++) {
			graph.remove(selected[i])
		}
		selected = []
		break
	case "arrowright":
		graph.move(1, 0, selected)
		break
	case "arrowleft":
		graph.move(-1, 0, selected)
		break
	case "arrowup":
		graph.move(0, -1, selected)
		break
	case "arrowdown":
		graph.move(0, 1, selected)
		break
	default:
		if (selected.length == 1) {
			selected[0].edit(key)
		}
		break
	}
	if (x != null) {
		resetSelected(x)
	}
}

function getUserNumber(text: string): number {
	let ans = window.prompt(text, "")
	if (ans == null) {
		return 0
	} else {
		let x =  parseFloat(ans)
		if (isNaN(x)) {
			return 0
		}
		return x
	}
}

let selected: graph.drawable[]

let x = 0
let y = 0

document.body.onmousedown = function(ev: MouseEvent) {
	if (!ev.shiftKey) {
		for (let i = 0; i < selected.length; i++) {
			selected[i].selected = false
		}
		selected = []
	}
	let c = graph.findAt(ev.pageX, ev.pageY)
	if (c == null) {
		x = ev.pageX
		y = ev.pageY
		return
	}
	for (let i = 0; i < selected.length; i++) {
		if (selected[i] == c) {
			selected[i] = selected[selected.length-1]
			selected[selected.length-1] = c
			return
		}
	}
	c.selected = true
	selected.push(c)
}

document.body.onmouseup = function(ev: MouseEvent) {
	let dest = graph.findAt(ev.pageX, ev.pageY)
	if (dest == null) {
		if (selected.length == 0) {
			graph.moveAll(ev.pageX - x, ev.pageY - y)
		} else {
			graph.moveTo(selected, ev.pageX, ev.pageY)
		}
		return
	}
	for (let i = 0; i < selected.length; i++) {
		if (dest == selected[i]) {
			return
		}
	}
	for (let i = 0; i < selected.length; i++) {
		dest.addInput(selected[i])
	}
}

function addOperator(): graph.drawable | null {
	let text = "Please enter shader name or number"
	let allShaders = Object.keys(shaders.all)
	for (let i = 0; i < allShaders.length; i++) {
		text += "\n  " + (i+1).toString() + ": " + allShaders[i]
	}
	var shaderName = window.prompt(text, "")
	if (shaderName != null) {
		return graph.addOperator(shaderName)
	}
	return null
}

function addTemplate() {
	let text = "Please enter template name"
	let templates = Object.keys(template.all)
	for (let i = 0; i < templates.length; i++) {
		text += "\n  " + (i+1).toString() + ": " + templates[i]
	}
	let name = window.prompt(text, "")
	if (name == null) {
		return
	}
	if (!(name in template.all)) {
		return
	}
	let data = template.all[name]
	let result: graph.drawable[] = []
	resetSelected()
	for (let i = 0; i < data.length; i++) {
		let x = graph.addOperator(data[i].name)
		if (x == null) {
			return
		}
		result.push(x)
		for (let j = 0; j < data[i].ins.length; j++) {
			let idx = data[i].ins[j]
			x.addInput(result[idx])
			x.x = Math.max(x.x, result[idx].x + result[idx].w + 50 + x.w)
		}
		for (let j = 0; j < selected.length; j++) {
			if (Math.abs(selected[j].x - x.x) < x.w) {
				x.y = selected[j].y + selected[j].h + 50 + x.h
			}
		}
		selected.push(x)
		x.selected = true
	}
}

