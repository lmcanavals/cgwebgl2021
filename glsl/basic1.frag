#version 300 es

precision highp float;

out vec4 color;

uniform vec3 u_light_color;

void main() {
	color = vec4(u_light_color, 1.0);
}

