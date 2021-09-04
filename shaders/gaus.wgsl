[[block]] struct Parameter {
	radius: f32;
	deviation: f32;
};

[[group(0), binding(0)]] var input : texture_2d<f32>;
[[group(0), binding(1)]] var output : texture_storage_2d<rgba8unorm, write>;
[[group(0), binding(2)]] var<uniform> parameter: Parameter;

[[stage(compute), workgroup_size(1, 1, 1)]]
fn main([[builtin(workgroup_id)]] WorkGroupID : vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	var radius = i32(parameter.radius);
	var color = vec3<f32>(0.0, 0.0, 0.0);

	let o2 = parameter.deviation * parameter.deviation;
	var sum = 0.0;
	for (var i = -radius; i <= radius; i = i + 1) {
		for (var j = -radius; j <= radius; j = j + 1) {
			let weight = (
				  1.0 / ( 2.0 * 3.1415926535897932384626433832795 * o2)
				* pow(2.7182818284590452353602874713526, - (f32(i * i) + f32(j * j)) / (2.0 * o2))
			);
			color = color + textureLoad(input, id + vec2<i32>(i, j), 0).rgb * weight;
			sum = sum + weight;
		}
	}
	color = color / sum;
	textureStore(output, id, vec4<f32>(color, 1.0));
}
