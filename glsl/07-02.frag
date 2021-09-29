#version 300 es

precision highp float;

in vec2 v_tex;
in vec3 v_normal;
out vec4 color;

uniform sampler2D texData;

void main() {
	color = texture(texData, v_tex);
}
