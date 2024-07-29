export function Parse(src) {
    let info = {};
    info.tooltip = "";
    info.parameter = [];
    let lines = src.split("\n");
    if (lines[0].substring(0, 2) != "//") {
        return "expected comment with input count in first line";
    }
    try {
        info.inputs = parseInt(lines[0].substring(2));
    }
    catch (ev) {
        return "could not parse input count";
    }
    for (let i = 1; true; i++) {
        let line = lines[i];
        if (line.substring(0, 2) != "//") {
            break;
        }
        let param = {};
        let split = line.substring(2).split("|");
        if (split.length != 5) {
            return "wrong info count in " + i.toString() + ". parameter";
        }
        param.name = split[0];
        param.min = parseFloat(split[1]);
        if (isNaN(param.min)) {
            return "minimum not a number";
        }
        param.step = parseFloat(split[2]);
        if (isNaN(param.step)) {
            return "step not a number";
        }
        param.max = parseFloat(split[3]);
        if (isNaN(param.max)) {
            return "maximum not a number";
        }
        param.default = parseFloat(split[4]);
        if (isNaN(param.default)) {
            return "default not a number";
        }
        info.parameter.push(param);
    }
    return info;
}
