#version 300 es

in vec2 vertexPosition;
in int vertexStyle;

uniform vec4[128] STYLETABLE;
uniform mat3 VIEW;

out vec3 fragColor;

void main(){
    vec3 transforedPosition = VIEW * vec3(vertexPosition.x, vertexPosition.y, 1);
    gl_Position = vec4(transforedPosition, 1);
    fragColor = STYLETABLE[vertexStyle].xyz;
}