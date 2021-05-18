precision mediump float;
varying vec2 uv;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform vec2 size;

void main() {
	vec3 x = texture2D(texture0, uv).rgb;
	vec3 y = texture2D(texture1, uv).rgb;

	gl_FragColor.rgb = sqrt(x*x + y*y) / 1.41421356237309504880168872420969;
	gl_FragColor.a = 1.0;
}