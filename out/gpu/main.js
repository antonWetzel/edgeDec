import * as shader from './shader.js';
let device;
export async function setup() {
    const w = 100;
    const h = 100;
    let adapter = await navigator.gpu.requestAdapter();
    if (adapter == null) {
        alert("adapter error");
        return;
    }
    device = await adapter.requestDevice();
    let inputData = [
        1, 2,
        0, 0, 0, 255,
        255, 255, 255, 255,
    ];
    let uniformBuffer = device.createBuffer({
        mappedAtCreation: true,
        size: 2 * 4,
        usage: GPUBufferUsage.STORAGE,
    });
    let view = uniformBuffer.getMappedRange();
    new Uint32Array(view).set([100, 100]);
    uniformBuffer.unmap();
    let inputBuffer = device.createBuffer({
        mappedAtCreation: true,
        size: inputData.length * 4,
        usage: GPUBufferUsage.STORAGE,
    });
    view = inputBuffer.getMappedRange();
    new Int32Array(view).set(inputData);
    inputBuffer.unmap();
    let resultBuffer = device.createBuffer({
        size: inputData.length * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    let bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage"
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage"
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage"
                }
            }
        ]
    });
    let bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: inputBuffer
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: resultBuffer
                }
            },
        ]
    });
    let src = await shader.Load("test");
    let module = device.createShaderModule({ code: src });
    let pipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        compute: { module: module, entryPoint: "main" }
    });
    let encoder = device.createCommandEncoder();
    let pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatch(100, 100);
    pass.endPass();
    let destBuffer = device.createBuffer({
        size: inputData.length * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    encoder.copyBufferToBuffer(resultBuffer, 0, destBuffer, 0, inputData.length * 4);
    let commands = encoder.finish();
    device.queue.submit([commands]);
    await destBuffer.mapAsync(GPUMapMode.READ);
    let arrayBuffer = destBuffer.getMappedRange();
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    if (context == null) {
        alert("no context");
        return;
    }
    let input = context.getImageData(0, 0, canvas.width, canvas.height);
}
