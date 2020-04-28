#version 300 es

in lowp vec3 fragColor;
in lowp vec3 fragEdgeDistance;
out lowp vec3 color;

void main(){
    color = fragColor;
    if(fragEdgeDistance.x > 0.9 || fragEdgeDistance.y > 0.9 || fragEdgeDistance.z > 0.9){
        color = vec3(1, 0, 0);
    }
}