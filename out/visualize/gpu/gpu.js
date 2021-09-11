import * as Module from './module.js';
import * as Request from '../../helper/request.js';
export let adapter;
export let device;
export let clearColor = { r: 0.2, g: 0.4, b: 0.6, a: 1.0 };
export let format;
let pipeline;
let sampler;
let quadBuffer;
export let encoder;
const vertices = new Float32Array([
    -1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0,
]);
export async function Setup() {
    adapter = await window.navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();
    let quad = await Request.getFile("../shaders/quad.wgsl");
    let module = await Module.New(quad);
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("webgpu");
    format = context.getPreferredFormat(adapter);
    pipeline = device.createRenderPipeline({
        vertex: {
            module: module,
            entryPoint: 'vertexMain',
            buffers: [{
                    attributes: [{
                            shaderLocation: 0,
                            offset: 0 * 4,
                            format: 'float32x2'
                        }],
                    arrayStride: 2 * 4,
                    stepMode: 'vertex'
                }]
        },
        fragment: {
            module: module,
            entryPoint: 'fragmentMain',
            targets: [{
                    format: format
                }]
        },
        primitive: {
            topology: 'triangle-strip',
            stripIndexFormat: "uint32"
        }
    });
    quadBuffer = CreateBuffer(vertices, GPUBufferUsage.VERTEX);
    sampler = device.createSampler({
        minFilter: "linear",
        magFilter: "nearest",
    });
}
export async function Create() {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("webgpu");
    let format = context.getPreferredFormat(adapter);
    context.configure({
        device: device,
        format: format
    });
    canvas.draw = (texture) => {
        let renderPass = encoder.beginRenderPass({
            colorAttachments: [
                { loadValue: clearColor, storeOp: "store", view: context.getCurrentTexture().createView() },
            ]
        });
        let group = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: sampler,
                }, {
                    binding: 1,
                    resource: texture.resource
                }
            ]
        });
        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, group);
        renderPass.setVertexBuffer(0, quadBuffer);
        renderPass.draw(4);
        renderPass.endPass();
    };
    canvas.resize = (width, height) => {
        context.configure({
            device: device,
            format: format,
            size: { width: width, height: height }
        });
        canvas.width = width;
        canvas.height = height;
    };
    return canvas;
}
export function Start() {
    encoder = device.createCommandEncoder();
}
export function End() {
    device.queue.submit([encoder.finish()]);
    encoder = undefined;
}
export async function NewCompute(src) {
    let module = await Module.New(src);
    let compute = {};
    let pipeline = device.createComputePipeline({
        compute: {
            module: module,
            entryPoint: "main"
        }
    });
    compute.Calculate = (input, parameter, result) => {
        let array = [];
        for (let i = 0; i < input.length; i++) {
            array.push({
                binding: i,
                resource: input[i].resource
            });
            if (result.width != input[i].width || result.height != input[i].height) {
                alert("dimension mismatch");
                return;
            }
        }
        array.push({
            binding: input.length,
            resource: result.resource
        });
        if (parameter != null) {
            array.push({
                binding: input.length + 1,
                resource: { buffer: parameter }
            });
        }
        let group = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: array,
        });
        let pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        pass.dispatch(result.width, result.height);
        pass.endPass();
    };
    return compute;
}
export function CreateBuffer(data, usage) {
    let buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.COPY_DST | usage,
        mappedAtCreation: true,
    });
    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer));
    buffer.unmap();
    return buffer;
}
