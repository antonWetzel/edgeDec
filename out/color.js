"use strict";
//exports the colors for other files
var color;
(function (color) {
    let colors = [
        {
            boxNormal: "#000000",
            boxSelected: "#00FF00",
            boxBackground: "#FFFFFF",
            background: "#DDDDDD",
            text: "#000000",
            arrow: "#000000",
        },
        {
            boxNormal: "#333333",
            boxSelected: "#005500",
            boxBackground: "#000000",
            background: "#222222",
            text: "#AAAAAA",
            arrow: "#444444",
        }
    ];
    //change to the next color
    function advance() {
        let c = colors.shift();
        if (c == undefined) {
            return; //should not happen
        }
        colors.push(c);
        color.boxNormal = c.boxNormal;
        color.boxSelected = c.boxSelected;
        color.boxBackground = c.boxBackground;
        color.background = c.background;
        color.text = c.text;
        color.arrow = c.arrow;
    }
    color.advance = advance;
    //setup the first color
    advance();
})(color || (color = {}));
