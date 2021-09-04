import * as GPU from './gpu.js'

export async function FromImage(img: HTMLImageElement): Promise<GPU.Texture> {
	await img.decode()
	let bitmap = await createImageBitmap(img)
	let texture = GPU.device.createTexture({
		size: { width: bitmap.width, height: bitmap.height },
		format: GPU.format,
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
	})
	GPU.device.queue.copyExternalImageToTexture(
		{ source: bitmap },
		{ texture: texture },
		{ width: bitmap.width, height: bitmap.height },
	)
	return {
		resource: texture.createView(),
		width: bitmap.width,
		height: bitmap.height,
	}
}

export async function FromVideo(vid: HTMLVideoElement): Promise<GPU.Texture> {
	let canvas = document.createElement("canvas")
	canvas.width = vid.videoWidth
	canvas.height = vid.videoHeight
	let ctx = canvas.getContext("2d")
	if (ctx == null) {
		alert("video canvas problem")
		return new Promise(() => { })
	}
	ctx.drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight);
	let texture = GPU.device.createTexture({
		size: { width: canvas.width, height: canvas.height },
		format: GPU.format,
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
	})
	GPU.device.queue.copyExternalImageToTexture(
		{ source: canvas },
		{ texture: texture },
		{ width: canvas.width, height: canvas.height },
	)
	return {
		resource: texture.createView(),
		width: canvas.width,
		height: canvas.height,
	}
}

export async function Blanc(width: number, height: number): Promise<GPU.Texture> {

	let texture = GPU.device.createTexture({
		size: {
			width: width,
			height: height,
		},
		format: 'rgba8unorm',
		usage:
			GPUTextureUsage.STORAGE_BINDING |
			GPUTextureUsage.TEXTURE_BINDING,
	})
	return {
		resource: texture.createView(),
		width: width,
		height: height,
	}
}

export function Sampler(): GPUSampler {
	return GPU.device.createSampler({
		magFilter: "nearest",
		minFilter: "nearest",
	})
}
