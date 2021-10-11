#version 300 es

in vec3 a_position;
in vec3 a_color;
in vec3 a_normal;

out vec3 v_position;
out vec3 v_color;
out vec3 v_normal;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
	v_position = vec3(u_world * vec4(a_position, 1.0));
	v_color = a_color;
	v_normal = vec3(u_world * vec4(a_normal, 1.0));

	gl_Position = u_projection * u_view * u_world * vec4(a_position, 1.0);
}
