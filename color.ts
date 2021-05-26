namespace color {

	type config = {
		boxNormal: string
		boxSelected: string
		boxBackground: string

		background: string
		text: string
		arrow: string
	}
	
	export let light: config = {
		boxNormal: "#000000",
		boxSelected: "#00FF00",
		boxBackground: "#FFFFFF",

		background: "#DDDDDD",
		text: "#000000",
		arrow: "#000000",
	}
	
	export let dark: config = {
		boxNormal: "#333333",
		boxSelected: "#005500",
		boxBackground: "#000000",

		background: "#222222",
		text: "#AAAAAA",
		arrow: "#444444",
	}

	export function set(x: config) {
		boxNormal = x.boxNormal
		boxSelected = x.boxSelected
		boxBackground = x.boxBackground

		background = x.background
		text = x.text
		arrow = x.arrow
	}

	let colors = [light, dark]
	export function advance() {
		let c = colors.shift()
		if (c == undefined) {
			return
		}
		set(c)
		colors.push(c)
	}
	
	export let boxNormal: string
	export let boxSelected: string
	export let boxBackground: string

	export let background: string
	export let text: string
	export let arrow: string

	advance()
}