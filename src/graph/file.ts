import * as box from './box.js'
import * as graph from './graph.js'
import * as GPU from '../gpu/gpu.js'
import * as Texture from '../gpu/texture.js'

export function New(): void {
	let input = document.createElement("input")
	input.type = "file"
	input.accept = 'image/png,image/jpeg,video/mp4,video/webm'
	input.onchange = async () => {
		let files = input.files
		if (files == null || files.length == 0) {
			return
		}
		let file = files[0]
		let sep = file.name.split(".")

		switch (sep[sep.length - 1]) {
			case "png":
			case "jpg": {
				let img = document.createElement("img")
				let b = box.New(100, 100, 0)
				img.draggable = false
				b.append(img)
				b.update = async () => { }
				img.src = URL.createObjectURL(file)
				b.result = await Texture.FromImage(img)
				b.updated = true
				break
			}
			case "mp4":
			case "webm": {
				let vid = document.createElement("video")
				let b = box.New(100, 100, 0)
				b.append(vid)
				b.update = async () => { }
				b.updated = true
				vid.src = URL.createObjectURL(file)
				vid.volume = 0
				vid.autoplay = true
				vid.loop = true
				let handle: number
				vid.onplay = () => {
					let cb = async () => {
						b.result = await Texture.FromVideo(vid)
						b.recursiveReset()
						GPU.Start()
						await b.recursiveUpdate()
						GPU.End()
						handle = requestAnimationFrame(cb)
					}
					cb()
				}
				vid.onpause = () => {
					cancelAnimationFrame(handle)
					vid.play()
				}

				break
			}
			default:
				alert("file format not allowed")
				break
		}
	}
	input.click()
}
