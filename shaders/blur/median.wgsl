[[block]] struct Parameter {
	radius: f32;
};

[[group(0), binding(0)]] var input : texture_2d<f32>;
[[group(0), binding(1)]] var output : texture_storage_2d<rgba8unorm, write>;
[[group(0), binding(2)]] var<uniform> parameter: Parameter;

[[stage(compute), workgroup_size(1, 1, 1)]]
fn main([[builtin(workgroup_id)]] WorkGroupID : vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	let radius = i32(parameter.radius);
	let dim = 1 + 2 * radius;
	var colors: array<vec3<f32>, 25>;
	var indices: array<i32, 25>;
	var values: array<f32,  25>;

	for (var i = 0; i < dim; i = i + 1) {
		for (var j = 0; j < dim; j = j + 1) {
			var col = textureLoad(input, id + vec2<i32>(i - radius, j - radius), 0).rgb;
			let idx = i * dim + j;
			colors[idx] = col;
			values[idx] = col.r + col.g + col.b;
			indices[idx] = idx;
		}
	}
	for (var c = 0; c < dim * dim - 1; c = c + 1) {
		var min = c;

		for (var i = c + 1; i < dim * dim; i = i + 1) {
			if (values[i] < values[min]) {
				min = i;
			}
		}
		let val = values[c];
		let idx = indices[c];
		values[c] = values[min];
		indices[c] = indices[min];
		values[min] = val;
		indices[min] = idx;
	}
	let idx = indices[dim * dim / 2];
	textureStore(output, id, vec4<f32>(colors[idx], 1.0));
}
