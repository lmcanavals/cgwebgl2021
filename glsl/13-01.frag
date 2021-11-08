#version 300 es

precision highp float;

in vec2 v_texcoord;

out vec4 color;

uniform sampler2D diffuseMap;

void main() {
	color = texture(diffuseMap, v_texcoord);
}
