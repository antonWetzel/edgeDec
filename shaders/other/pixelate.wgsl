struct Parameter {
	radius: f32,
};

@group(0) @binding(0) var input: texture_2d<f32>;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> parameter: Parameter;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	let radius = i32(parameter.radius);
	let tile = (id / radius) * radius;
	var color = vec3<f32>(0.0, 0.0, 0.0);
	for (var i = 0; i < radius; i = i + 1) {
		for (var j = 0; j < radius; j = j + 1) {
			color = color + textureLoad(input, tile + vec2<i32>(i, j), 0).rgb;
		}
	}
	color = color / f32(radius * radius);
	textureStore(output, id, vec4<f32>(color, 1.0));
}
