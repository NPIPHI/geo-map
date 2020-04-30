#version 300 es

in vec2 vertexPosition;
in vec2 vertexNormal;
in int vertexStyle;

uniform vec4[128] STYLETABLE1;
uniform vec4[128] STYLETABLE2;
uniform mat3 VIEW;
uniform float STYLESCALAR;
uniform float ZOOMLEVEL;
uniform float RENDERHEIGHT;

out vec3 fragColor;

void main(){
    vec4 style = STYLETABLE1[vertexStyle] * STYLESCALAR + STYLETABLE2[vertexStyle] * (1.f-STYLESCALAR);
    float thickness = style.w / RENDERHEIGHT / ZOOMLEVEL;
    vec3 transforedPosition = VIEW * vec3(vertexPosition.x + vertexNormal.x * thickness, vertexPosition.y + vertexNormal.y * thickness, 1);
    gl_Position = vec4(transforedPosition, 1);
    fragColor = style.xyz;
}