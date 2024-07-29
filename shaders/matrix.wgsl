//special shader for matrix computation

struct Matrix {
	size: f32,
	min: f32,
	max: f32,
	data: array<f32>,
};

@group(0) @binding(0) var input: texture_2d<f32>;
@group(0) @binding(1) var output: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<storage, read> matrix: Matrix;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);

	let size = i32(matrix.size);
	var color = vec3<f32>(0.0, 0.0, 0.0);
	for (var i = 0; i < size; i = i + 1) {
		for (var j = 0; j < size; j = j + 1) {
			color = color + textureLoad(input, id + vec2<i32>(i - size/2, j - size/2), 0).rgb * matrix.data[i + j * size];
		}
	}
	color = (color - matrix.min) / (matrix.max - matrix.min);
	textureStore(output, id, vec4<f32>(color, 1.0));
}
