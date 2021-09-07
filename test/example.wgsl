//{"inputs": 1, "parameter": [{"name": "shift", "min": 0, "step": 1, "max": 2, "default": 1}]}

[[block]] struct Parameter {
	shift: f32;
};

[[group(0), binding(0)]] var input : texture_2d<f32>;
[[group(0), binding(1)]] var output : texture_storage_2d<rgba8unorm, write>;
[[group(0), binding(2)]] var<uniform> parameter: Parameter;

[[stage(compute), workgroup_size(1, 1, 1)]]
fn main([[builtin(workgroup_id)]] WorkGroupID : vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	var color = textureLoad(input, id, 0).rgb;
	var copy: vec3<f32>;
	switch (i32(parameter.shift)) {
		case 1: {
			copy.r = color.b;
			copy.g = color.r;
			copy.b = color.g;
		}
		case 2: {
			copy.r = color.g;
			copy.g = color.b;
			copy.b = color.r;
		}
		default: {
			copy.r = color.r;
			copy.g = color.g;
			copy.b = color.b;
		}
	}
	textureStore(output, id, vec4<f32>(copy, 1.0));
}
