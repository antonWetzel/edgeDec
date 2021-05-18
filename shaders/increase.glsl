precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;
uniform float value;

void main() {
	gl_FragColor.rgb = texture2D(texture, uv).rgb * (1.0 + value);
	gl_FragColor.a = 1.0;
}