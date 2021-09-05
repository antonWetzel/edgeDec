
[[group(0), binding(0)]] var input : texture_2d<f32>;
[[group(0), binding(1)]] var output : texture_storage_2d<rgba8unorm, write>;

[[stage(compute), workgroup_size(1, 1, 1)]]
fn main([[builtin(workgroup_id)]] WorkGroupID : vec3<u32>) {
	let id = vec2<i32>(WorkGroupID.xy);
	var res = (
		  textureLoad(input, id + vec2<i32>(1, 0), 0).rgb * -1.0
		+ textureLoad(input, id + vec2<i32>(0, 1), 0).rgb * 1.0
	);
	res = res / 8.0 + 0.5;
	textureStore(output, id, vec4<f32>(res, 1.0));
}
