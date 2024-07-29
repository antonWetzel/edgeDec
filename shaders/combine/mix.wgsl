struct Parameter {
	preference: f32,
};


@group(0) @binding(0) var input0: texture_2d<f32>;
@group(0) @binding(1) var input1: texture_2d<f32>;
@group(0) @binding(2) var output: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> parameter: Parameter;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);

	let c0 = textureLoad(input0, id, 0).rgb;
	let c1 = textureLoad(input1, id, 0).rgb;
	let color = c0 * parameter.preference + c1 * (1.0 - parameter.preference);
	textureStore(output, id, vec4<f32>(color, 1.0));
}
