#version 300 es

precision highp float;

out vec4 color;

uniform vec4 ucolor;

void main() {
	color = ucolor;
}
