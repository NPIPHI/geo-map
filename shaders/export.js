fs = require("fs");

function extractUnifroms(shader){
    const regex = /uniform \w+ (\w+)/gm;
    let m;
    let uniforms = []
    while ((m = regex.exec(shader)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            uniforms.push(match);
        });
    }
    return uniforms
}

async function exportShaders(path = "../ts/shaders.json"){
    let pFragment = fs.readFileSync("./shaders/polyFragment.glsl", "utf8");
    let pVertex = fs.readFileSync("./shaders/polyVertex.glsl", "utf8");
    let oFragment = fs.readFileSync("./shaders/outlineFragment.glsl", "utf8");
    let oVertex = fs.readFileSync("./shaders/outlineVertex.glsl", "utf8");
    jsonObj = {polygon: {type: "Polygon", fragment: pFragment, vertex: pVertex, uniforms: extractUnifroms(pVertex)}, outline: {type: "Outline", fragment: oFragment, vertex: oVertex, uniforms: extractUnifroms[oVertex]}};
    fs.writeFileSync("./ts/shaders.json", JSON.stringify(jsonObj));
}

exportShaders();