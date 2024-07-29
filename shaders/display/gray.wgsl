
@group(0) @binding(0) var input: texture_2d<f32>;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	let color = textureLoad(input, id, 0).rgb;
	let average = (color.r + color.g + color.b) / 3.0;
	textureStore(output, id, vec4<f32>(average, average, average, 1.0));
}
