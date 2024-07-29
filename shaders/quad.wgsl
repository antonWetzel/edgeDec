//used to display result, not a compute shader

@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var myTexture: texture_2d<f32>;

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) fragUV: vec2<f32>,
};

@vertex
fn vertexMain(@location(0) position: vec2<f32>) -> VertexOutput {
  var output: VertexOutput;
  output.Position = vec4<f32>(position, 0.0, 1.0);
  output.fragUV = (position / 2.0 + 0.5);
  output.fragUV.y = 1.0 - output.fragUV.y;
  return output;
}

@fragment
fn fragmentMain(@location(0) fragUV: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, fragUV);
}
