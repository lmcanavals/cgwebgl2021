#version 300 es

precision highp float;

in vec2 fragTex;
out vec4 color;

uniform sampler2D texData;

void main() {
	color = texture(texData, fragTex);
}
