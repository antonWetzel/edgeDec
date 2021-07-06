//exports the colors for other files
namespace color {

	type config = {
		boxNormal: string
		boxSelected: string
		boxBackground: string

		background: string
		text: string
		arrow: string
	}

	let colors: config[] = [
		{ //light
			boxNormal: "#000000",
			boxSelected: "#00FF00",
			boxBackground: "#FFFFFF",

			background: "#DDDDDD",
			text: "#000000",
			arrow: "#000000",
		},
		{ //dark
			boxNormal: "#333333",
			boxSelected: "#005500",
			boxBackground: "#000000",

			background: "#222222",
			text: "#AAAAAA",
			arrow: "#444444",
		}
	]
	//change to the next color
	export function advance() {
		let c = colors.shift()
		if (c == undefined) {
			return //should not happen
		}
		colors.push(c)

		boxNormal = c.boxNormal
		boxSelected = c.boxSelected
		boxBackground = c.boxBackground

		background = c.background
		text = c.text
		arrow = c.arrow
	}

	export let boxNormal: string
	export let boxSelected: string
	export let boxBackground: string

	export let background: string
	export let text: string
	export let arrow: string

	//setup the first color
	advance()
}
