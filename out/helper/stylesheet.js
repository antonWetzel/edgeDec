import * as Cookie from './cookie.js';
export function SetColor(change) {
    let mode = Cookie.Get("mode");
    if (mode != "light" && mode != "dark") {
        mode = "light";
    }
    if (change) {
        mode = (mode != "light") ? "light" : "dark";
    }
    let sheet = document.getElementById("color");
    sheet.href = "../css/" + mode + ".css";
    Cookie.Set("mode", mode);
}
