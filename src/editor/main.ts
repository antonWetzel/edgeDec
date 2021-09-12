import * as Stylesheet from '../helper/stylesheet.js'
import * as Input from './input.js'
import * as GPU from '../gpu/gpu.js'
import * as Output from './output.js'
import * as Request from '../helper/request.js'
import * as Info from '../helper/info.js'
import * as Text from './text.js'

document.body.onload = async () => {
	document.body.onkeydown = (ev) => {
		if (ev.code == "KeyC") {
			Stylesheet.SetColor(true)
		}
	}
	Stylesheet.SetColor(false)
	await GPU.Setup()

	GPU.Create()
	Input.Setup()
	await Output.Setup()
	await Text.Setup()
	Output.Update(Text.text.value)
}
