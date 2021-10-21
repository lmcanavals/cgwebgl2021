#version 300 es

precision highp float;

in vec4 v_position;
in vec3 v_normal;
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

uniform vec3 u_light_position;
uniform vec3 u_light_color;

void main() {

	// ambient
	float strength = 0.15;
	vec3 ambient = strength * u_light_color * texture(diffuseMap, v_texcoord).rgb;

	// diffuse
	vec3 norm = normalize(v_normal);
	vec3 objectColorDir = normalize(u_light_position - v_position.xyz);
	float diff = max(dot(norm, objectColorDir), 0.0);
	vec3 diffuse = diff * u_light_color;

	vec3 result = (ambient + diffuse);
	color = vec4(result, 1.0);
}

