#version 300 es

precision highp float;

in vec3 v_position;
in vec3 v_color;
in vec3 v_normal;

out vec4 color;

uniform vec3 u_light_position;
uniform vec3 u_light_color;

void main() {

	// ambient
	float strength = 0.15;
	vec3 ambient = strength * u_light_color;

	// diffuse
	vec3 norm = normalize(v_normal);
	vec3 objectColorDir = normalize(u_light_position - v_position);
	float diff = max(dot(norm, objectColorDir), 0.0);
	vec3 diffuse = diff * u_light_color;

	vec3 result = (ambient + diffuse) * v_color;
	color = vec4(result, 1.0);
}

