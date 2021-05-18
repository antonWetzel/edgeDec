"use strict";
var color;
(function (color) {
    color.light = {
        boxNormal: "#000000",
        boxSelected: "#00FF00",
        boxBackground: "#FFFFFF",
        background: "#DDDDDD",
        text: "#000000",
        arrow: "#000000",
    };
    color.dark = {
        boxNormal: "#FFFFFF",
        boxSelected: "#00FF00",
        boxBackground: "#000000",
        background: "#222222",
        text: "#FFFFFF",
        arrow: "#FFFFFF",
    };
    function set(x) {
        color.boxNormal = x.boxNormal;
        color.boxSelected = x.boxSelected;
        color.boxBackground = x.boxBackground;
        color.background = x.background;
        color.text = x.text;
        color.arrow = x.arrow;
    }
    color.set = set;
    let colors = [color.light, color.dark];
    function advance() {
        let c = colors.shift();
        if (c == undefined) {
            return;
        }
        set(c);
        colors.push(c);
    }
    color.advance = advance;
    advance();
})(color || (color = {}));
