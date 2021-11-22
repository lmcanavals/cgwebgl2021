#version 300 es

precision highp float;

struct DirLight {
	vec3 direction;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct PointLight {
	vec3 position;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

	float constant;
	float linear;
	float quadratic;
};

struct SpotLight {
	vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

	float ambient;
	float diffuse;
	float specular;

	float constant;
	float linear;
	float quadratic;
};

in vec4 v_position;
in vec3 v_normal;
in vec2 v_texcoord;
in vec4 v_color;

out vec4 color;

#define NUM_POINT_LIGHTS 4
#define NUM_SPOT_LIGHTS 3

uniform DirLight u_dirLight;
uniform PointLight u_pointLights[NUM_POINT_LIGHTS];
uniform SpotLight u_spotLights[NUM_SPOT_LIGHTS];

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

uniform vec3 u_viewPosition; // pov position (camera)


vec3 calcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
	vec3 lightDir = normalize(-light.direction);
	float diff = max(dot(normal, lightDir), 0.0);

	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

	vec3 ambient = light.ambient * vec3(texture(diffuseMap, v_texcoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(diffuseMap, v_texcoord));
	vec3 specular = light.specular * spec * vec3(texture(specularMap, v_texcoord));

	return ambient + diffuse + specular;
}

vec3 calcPointLight(PointLight light, vec3 normal, vec3 viewDir) {
	vec3 lightDir = normalize(light.position - v_position.xyz);
	float diff = max(dot(normal, lightDir), 0.0);

	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

	float distance = length(light.position - v_position.xyz);
	float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

	vec3 ambient = light.ambient * vec3(texture(diffuseMap, v_texcoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(diffuseMap, v_texcoord));
	vec3 specular = light.specular * spec * vec3(texture(specularMap, v_texcoord));

	ambient *= attenuation;
	diffuse *= attenuation;
	specular *= attenuation;

	return ambient + diffuse + specular;
}

vec3 calcSpotLight(SpotLight light, vec3 normal, vec3 viewDir) {
	vec3 lightDir = normalize(light.position - v_position.xyz);
	float diff = max(dot(normal, lightDir), 0.0);

	vec3 reflectDir = reflect(-lightDir, normal);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
	float distance = length(light.position - v_position.xyz);
	float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

	float theta = dot(lightDir, normalize(-light.direction));
	float epsilon = light.cutOff - light.outerCutOff;
	float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

	vec3 ambient = light.ambient * vec3(texture(diffuseMap, v_texcoord));
	vec3 diffuse = light.diffuse * diff * vec3(texture(diffuseMap, v_texcoord));
	vec3 specular = light.specular * spec * vec3(texture(specularMap, v_texcoord));

	ambient *= attenuation * intensity;
	diffuse *= attenuation * intensity;
	specular *= attenuation * intensity;

	return ambient + diffuse + specular;
}

void main() {
	vec3 norm = normalize(v_normal);
	vec3 viewDir = normalize(u_viewPosition - v_position.xyz);

	vec3 result = calcDirLight(u_dirLight, norm, viewDir);
	
	for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
		result += calcPointLight(u_pointLights[i], norm, viewDir);
	}

	for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {
		result += calcSpotLight(u_spotLights[i], norm, viewDir);
	}

	//color = vec4(result * ambient * diffuse /*+ emissive*/, opacity);
	color = vec4(1.0, 0.0, 0.0, 1.0);
}

