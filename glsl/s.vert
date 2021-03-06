#version 300 es

in vec3 position;
in vec3 color;
in mat4 model;

out vec3 v_color;

uniform mat4 view;
uniform mat4 projection;

void main() {
	gl_Position = projection * view * model * vec4(position, 1.0);
	v_color     = color;
}
