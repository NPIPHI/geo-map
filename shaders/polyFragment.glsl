#version 300 es

in lowp vec3 fragColor;
out lowp vec4 color;

void main(){
    color = vec4(fragColor, 1);
}