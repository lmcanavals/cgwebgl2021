#version 300 es

in vec3 a_position;
in vec3 a_color;
in vec3 a_normal;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
	gl_Position = u_projection * u_view * u_world * vec4(a_position, 1.0);
}
