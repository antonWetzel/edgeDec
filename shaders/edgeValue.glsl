precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;

void main() {
	vec3 x = texture2D(texture, uv).rgb;

	gl_FragColor.rgb = abs(x-0.5) * 2.0;
	gl_FragColor.a = 1.0;
}