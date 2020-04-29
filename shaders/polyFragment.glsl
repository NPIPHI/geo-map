#version 300 es

in lowp vec3 fragColor;
out lowp vec3 color;

void main(){
    color = fragColor;
}