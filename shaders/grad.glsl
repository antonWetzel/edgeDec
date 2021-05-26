precision mediump float;
varying vec2 uv;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform vec2 size;

void main() {
	vec3 x = texture2D(texture0, uv).rgb * 2.0 - 1.0;
	vec3 y = texture2D(texture1, uv).rgb * 2.0 - 1.0;

	gl_FragColor.rgb = atan(x, y) / 3.1415926535897932384626433832795 / 2.0 + 0.5;
	gl_FragColor.a = 1.0;
}
