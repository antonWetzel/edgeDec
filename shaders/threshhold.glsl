precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;
uniform float threshhold;

void main() {
	vec3 col = texture2D(texture, uv).rgb;
	if (col.r < threshhold) {
		col.r = 0.0;
	} else {
		col.r = 1.0;
	}
	if (col.g < threshhold) {
		col.g = 0.0;
	} else {
		col.g = 1.0;
	}
	if (col.b < threshhold) {
		col.b = 0.0;
	} else {
		col.b = 1.0;
	}
	gl_FragColor.rgb = col;
	gl_FragColor.a = 1.0;
}