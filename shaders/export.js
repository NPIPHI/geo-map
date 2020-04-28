fs = require("fs");

async function exportShaders(path = "../ts/shaders.json"){
    let fragment = fs.readFileSync("./shaders/fragment.glsl", "utf8");
    let vertex = fs.readFileSync("./shaders/vertex.glsl", "utf8");
    jsonObj = {fragment, vertex};
    fs.writeFileSync("./ts/shaders.json", JSON.stringify(jsonObj));
}

exportShaders();