#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_viewSurface;
in vec2 v_texcoord;
in vec4 v_color;

out vec4 color;

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_viewPosition; // pov position (camera)

void main() {
	color = texture(diffuseMap, v_texcoord);
}

