precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;

void main() {
	vec3 res = vec3(0.0, 0.0, 0.0);
	res += texture2D(texture, uv + vec2(-2.0, -2.0) / size).rgb * 2.0;
	res += texture2D(texture, uv + vec2(-2.0, -1.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(-2.0, 0.0) / size).rgb * 5.0;
	res += texture2D(texture, uv + vec2(-2.0, 1.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(-2.0, 2.0) / size).rgb * 2.0;
	res += texture2D(texture, uv + vec2(-1.0, -2.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(-1.0, -1.0) / size).rgb * 9.0;
	res += texture2D(texture, uv + vec2(-1.0, 0.0) / size).rgb * 12.0;
	res += texture2D(texture, uv + vec2(-1.0, 1.0) / size).rgb * 9.0;
	res += texture2D(texture, uv + vec2(-1.0, 2.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(0.0, -2.0) / size).rgb * 5.0;
	res += texture2D(texture, uv + vec2(0.0, -1.0) / size).rgb * 12.0;
	res += texture2D(texture, uv + vec2(0.0, 0.0) / size).rgb * 15.0;
	res += texture2D(texture, uv + vec2(0.0, 1.0) / size).rgb * 12.0;
	res += texture2D(texture, uv + vec2(0.0, 2.0) / size).rgb * 5.0;
	res += texture2D(texture, uv + vec2(1.0, -2.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(1.0, -1.0) / size).rgb * 9.0;
	res += texture2D(texture, uv + vec2(1.0, 0.0) / size).rgb * 12.0;
	res += texture2D(texture, uv + vec2(1.0, 1.0) / size).rgb * 9.0;
	res += texture2D(texture, uv + vec2(1.0, 2.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(2.0, -2.0) / size).rgb * 2.0;
	res += texture2D(texture, uv + vec2(2.0, -1.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(2.0, 0.0) / size).rgb * 5.0;
	res += texture2D(texture, uv + vec2(2.0, 1.0) / size).rgb * 4.0;
	res += texture2D(texture, uv + vec2(2.0, 2.0) / size).rgb * 2.0;
	gl_FragColor.rgb = res / 159.0;
	gl_FragColor.a = 1.0;
}
