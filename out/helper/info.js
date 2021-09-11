export function Parse(src) {
    let info = {};
    info.tooltip = "";
    info.parameter = [];
    let lines = src.split("\n");
    if (lines[0].substring(0, 2) != "//") {
        alert("expected comment with input count in first line");
    }
    try {
        info.inputs = parseInt(lines[0].substring(2));
    }
    catch (ev) {
        alert("could not parse input count");
    }
    for (let i = 1; true; i++) {
        let line = lines[i];
        if (line.substring(0, 2) != "//") {
            break;
        }
        let param = {};
        let split = line.substring(2).split("|");
        if (split.length != 5) {
            alert("wrong info count in parameter " + i.toString());
        }
        try {
            param.name = split[0];
            param.min = parseFloat(split[1]);
            param.step = parseFloat(split[2]);
            param.max = parseFloat(split[3]);
            param.default = parseFloat(split[4]);
        }
        catch (ev) {
            alert("could not parse infos for parameter " + i.toString());
        }
        info.parameter.push(param);
    }
    return info;
}
