#version 300 es

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec4 v_position;
out vec3 v_normal;
out vec2 v_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
	vec4 position = u_world * a_position;

	v_position = position;
	v_normal = mat3(u_world) * a_normal;
	v_texcoord = a_texcoord;

	gl_Position = u_projection * u_view * position;
}

