#version 300 es

in vec2 worldVertexPosition;
in vec3 vertexColor;
uniform mat3 VIEW;

out vec3 fragColor;

void main(){
    vec3 transforedPosition = VIEW * vec3(worldVertexPosition.x, worldVertexPosition.y, 1);
    gl_Position = vec4(transforedPosition, 1);
    fragColor = vertexColor;
}