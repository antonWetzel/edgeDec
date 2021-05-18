precision mediump float;
varying vec2 uv;
uniform sampler2D texture;
uniform vec2 size;

void main() {
	const int dim = 5;

	vec3 colors[dim*dim];
	float values[dim*dim];

	for (int i = 0; i < dim; i++) {
		for (int j = 0; j < dim; j++) {
			vec3 col = texture2D(texture, uv + vec2(i-dim/2, j-dim/2) / size).rgb;
			colors[i*dim+j] = col;
			values[i*dim+j] = col.r + col.g + col.b;
		}
	}


	for (int c = 0; c < dim*dim; c++) { 
		for (int i = 0; i < dim*dim-1; i++) {
			if (values[i] > values[i+1]) {
				float val = values[i];
				vec3 col = colors[i];
				values[i] = values[i+1];
				colors[i] = colors[i+1];
				values[i+1] = val;
				colors[i+1] = col;
			}
		}
	}

	gl_FragColor.rgb = colors[dim*dim/2];
	gl_FragColor.a = 1.0;
}
