import * as box from './box.js'
import * as graph from './graph.js'
import * as GPU from '../gpu/gpu.js'
import * as Texture from '../gpu/texture.js'

export async function New() {
	try {
		let stream = await navigator.mediaDevices.getUserMedia({ video: true })
		let vid = document.createElement("video")
		let b = box.New(100, 100, 0)
		b.append(vid)
		b.update = async () => { }
		vid.srcObject = stream
		vid.autoplay = true
		vid.onplay = () => {
			let cb = async () => {
				b.result = await Texture.FromVideo(vid)
				GPU.Start()
				await b.update()
				GPU.End()
				requestAnimationFrame(cb)
			}
			cb()
		}
	} catch (ev) {
		alert("webcam not found")
	}
}
