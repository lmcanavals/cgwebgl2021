#version 300 es

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;
in vec4 a_color;

out vec4 v_position;
out vec3 v_normal;
out vec2 v_texcoord;
out vec4 v_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
	v_position = u_world * a_position;
	v_normal = vec3(u_world * vec4(a_normal, 1.0));
	v_texcoord = a_texcoord;
	v_color = vec4(1.0, 0.0, 0.0, 1.0);

	gl_Position = u_projection * u_view * v_position;
}
