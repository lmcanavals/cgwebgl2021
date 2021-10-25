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

uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_viewPosition; // pov position (camera)

void main() {
	vec3 normal = normalize(v_normal);
	vec4 mapColor = texture(diffuseMap, v_texcoord);
	vec3 lightDir = normalize(u_lightPosition - v_position.xyz);

	// ambient light
	vec3 ambientLight = u_ambientLight * ambient;

	// diffuse light
	float diffuseFactor = max(dot(normal, lightDir), 0.0);
	vec3 diffuseLight = diffuseFactor * diffuse;


	vec3 result = (ambientLight + diffuseLight) * mapColor.rgb;
	color = vec4(result, 1.0);
}

