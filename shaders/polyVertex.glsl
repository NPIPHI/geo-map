#version 300 es

in vec2 vertexPosition;
in int vertexStyle;

uniform vec4[32] STYLETABLE1;
uniform vec4[32] STYLETABLE2;
uniform mat3 VIEW;
uniform float STYLESCALAR;
uniform float ZOOMLEVEL;
uniform float RENDERHEIGHT;

out vec4 fragColor;

void main(){
    gl_Position = vec4(VIEW * vec3(vertexPosition.x, vertexPosition.y, 1), 1);
    fragColor = mix(STYLETABLE2[vertexStyle], STYLETABLE1[vertexStyle], STYLESCALAR);
}