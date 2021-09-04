import * as GPU from './gpu.js'
import * as Request from '../helper/request.js'

export async function New(path: string): Promise<GPUShaderModule> {
	let src = await Request.getFile(path)
	let module = GPU.device.createShaderModule({
		code: src
	})
	return module
}
