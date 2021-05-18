precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;

void main() {
	vec4 col = texture2D(texture, uv);
	float g = max(col.r, max(col.g, col.b));

	gl_FragColor.rgb = vec3(g, g, g);
	gl_FragColor.a = 1.0;
}