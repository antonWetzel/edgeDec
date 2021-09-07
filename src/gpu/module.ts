import * as GPU from './gpu.js'

export async function New(src: string): Promise<GPUShaderModule> {
	let module = GPU.device.createShaderModule({
		code: src
	})
	return module
}
