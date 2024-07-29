//convert to array index
fn off(grad: f32) -> vec2<i32> {
  var offsets = array<vec2<i32>, 9>(
		vec2<i32>( 0, -1),
		vec2<i32>(-1, -1),
		vec2<i32>(-1,  0),
		vec2<i32>(-1,  1),
		vec2<i32>( 0,  1),
		vec2<i32>( 1,  1),
		vec2<i32>( 1,  0),
		vec2<i32>( 1, -1),
		vec2<i32>( 0, -1),
	);
	return offsets[i32((grad + 1.0/16.0) * 8.0)];
}

@group(0) @binding(0) var input0: texture_2d<f32>;
@group(0) @binding(1) var input1: texture_2d<f32>;
@group(0) @binding(2) var output: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1, 1, 1)
fn main(@builtin(workgroup_id) WorkGroupID: vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);

	let val = textureLoad(input0, id, 0).rgb;
	let grad = textureLoad(input1, id, 0).rgb;

	let offR = off(grad.r);
	let offG = off(grad.g);
	let offB = off(grad.b);

	let r0 = textureLoad(input0, id + offR, 0).r;
	let g0 = textureLoad(input0, id + offG, 0).g;
	let b0 = textureLoad(input0, id + offB, 0).b;

	let r1 = textureLoad(input0, id - offR, 0).r;
	let g1 = textureLoad(input0, id - offG, 0).g;
	let b1 = textureLoad(input0, id - offB, 0).b;

	var res = vec3<f32>(0.0, 0.0, 0.0);
	if (val.r >= r0 && val.r > r1) {
		res.r = val.r;
	}
	if (val.g >= g0 && val.g > g1) {
		res.g = val.g;
	}
	if (val.b >= b0 && val.b > b1) {
		res.b = val.b;
	}
	textureStore(output, id, vec4<f32>(res, 1.0));
}
