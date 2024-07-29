
@group(0) @binding(0) var input: texture_2d<f32>;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	var color = textureLoad(input, id, 0).rgb;
	color = vec3<f32>(1.0, 1.0, 1.0) - color;
	textureStore(output, id, vec4<f32>(color, 1.0));
}
