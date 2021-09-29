#version 300 es

in vec4 a_position;
in vec2 a_tex;
in vec3 a_normal;

out vec2 v_tex;
out vec3 v_normal;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
	gl_Position = u_projection * u_view * u_world * a_position;
	v_tex = a_tex;
	v_normal = mat3(u_world) * a_normal;
}
