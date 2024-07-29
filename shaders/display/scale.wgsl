struct Parameter {
	scale: f32,
};

@group(0) @binding(0) var input: texture_2d<f32>;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> parameter: Parameter;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	var color = textureLoad(input, id, 0).rgb;
	color = color * parameter.scale;
	textureStore(output, id, vec4<f32>(color, 1.0));
}
