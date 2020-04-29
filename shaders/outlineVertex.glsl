#version 300 es

in vec2 vertexPosition;
in vec2 vertexNormal;
in lowp int vertexStyle;

uniform vec4[128] STYLETABLE; //r g b thickness
uniform mat3 VIEW;

out vec3 fragColor;

void main(){
    float thickness = STYLETABLE[vertexStyle].w;
    vec3 transforedPosition = VIEW * vec3(vertexPosition.x + vertexNormal.x * thickness, vertexPosition.y + vertexNormal.y * thickness, 1);
    gl_Position = vec4(transforedPosition, 1);
    fragColor = STYLETABLE[vertexStyle].xyz;
}