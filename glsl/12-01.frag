#version 300 es

precision highp float;

in vec4 v_position;
in vec3 v_normal;
in vec2 v_texcoord;
in vec4 v_color;

out vec4 color;

struct Light {
	vec3 ambient;
	float cutOff;
	float outerCutOff;
	vec3 direction;
	vec3 position;
	float constant;
	float linear;
	float quadratic;
};

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

uniform Light u_light;

uniform vec3 u_viewPosition; // pov position (camera)

void main() {
	vec3 normal = normalize(v_normal);
	vec4 mapColor = texture(diffuseMap, v_texcoord);
	vec4 mapSpec = texture(specularMap, v_texcoord);
	vec3 lightDir = normalize(u_light.position - v_position.xyz);

	// ambient light
	vec3 ambientLight = u_light.ambient * ambient * mapColor.rgb;

	float theta = dot(lightDir, normalize(-u_light.direction));
	float epsilon = (u_light.cutOff - u_light.outerCutOff);
	float intensity = clamp((theta - u_light.outerCutOff) / epsilon, 0.0, 1.0);

	// diffuse light
	float diffuseFactor = max(dot(normal, lightDir), 0.0);
	vec3 diffuseLight = diffuseFactor * diffuse * mapColor.rgb;

	// specular light
	vec3 viewDir = normalize(u_viewPosition - v_position.xyz);
	vec3 reflectDir = reflect(-lightDir, normal);
	float specularFactor = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
	vec3 specularLight = specularFactor	* specular * mapSpec.rgb;

	diffuseLight = diffuseLight * intensity;
	specularLight = specularLight * intensity;

	float distance = length(u_light.position - v_position.xyz);
	float attenuation = 1.0 / 
		(u_light.constant + u_light.linear * distance
		+ u_light.quadratic * distance * distance);

	ambientLight = ambientLight * attenuation;
	diffuseLight = diffuseLight * attenuation;
	specularLight = specularLight * attenuation;

	vec3 result = ambientLight + diffuseLight + specularLight;
	color = vec4(result, opacity);
}

