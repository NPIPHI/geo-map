fs = require("fs");

function extractUnifroms(shader){
    const regex = /uniform (?:lowp|highp|mediump)?\s?\S+ (\w+)\[?/gm;
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
    return uniforms.filter(match=>match.indexOf(' ')==-1) //dumb hack to remove the full matches
}

function extractAttributes(shader){
    const regex = /in (?:lowp|highp|mediump)?\s?\S+ (\w+)/gm;
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
    return uniforms.filter(match=>match.indexOf(' ')==-1) //dumb hack to remove the full matches
}

async function exportShaders(path = "../ts/shaders.json"){
    let pFragment = fs.readFileSync("./shaders/polyFragment.glsl", "utf8");
    let pVertex = fs.readFileSync("./shaders/polyVertex.glsl", "utf8");
    let oFragment = fs.readFileSync("./shaders/outlineFragment.glsl", "utf8");
    let oVertex = fs.readFileSync("./shaders/outlineVertex.glsl", "utf8");
    jsonObj = { polygon: {type: "Polygon", fragment: pFragment, vertex: pVertex, attributes: extractAttributes(pVertex), uniforms: extractUnifroms(pVertex)}, 
                outline: {type: "Outline", fragment: oFragment, vertex: oVertex, attributes: extractAttributes(oVertex), uniforms: extractUnifroms(oVertex)}};
    fs.writeFileSync("./ts/shaders.json", JSON.stringify(jsonObj));
}

exportShaders();