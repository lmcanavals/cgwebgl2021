#version 300 es

in vec4 a_position;
in vec2 a_texcoord;
in mat4 a_transform; // model matrix for instances

out vec2 v_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
	v_texcoord = a_texcoord;
	gl_Position = u_projection * u_view * u_world * a_transform * a_position;
}
