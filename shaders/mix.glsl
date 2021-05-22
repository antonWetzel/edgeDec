precision mediump float;
varying vec2 uv;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform float preference;
uniform vec2 size;

void main() {
	vec3 x = texture2D(texture0, uv).rgb;
	vec3 y = texture2D(texture1, uv).rgb;

	gl_FragColor.rgb = x * preference + y * (1.0 - preference);
	gl_FragColor.a = 1.0;
}