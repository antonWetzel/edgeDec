import * as Request from '../helper/request.js';
import * as Output from './output.js';
export let text;
export async function Setup() {
    let src = await Request.getFile("../test/example.wgsl");
    text = document.getElementById("text");
    text.value = src;
    text.onkeydown = (ev) => {
        setTimeout(() => { Output.Update(text.value); });
        ev.stopPropagation();
        if (ev.ctrlKey && ev.code == "KeyS") {
            ev.preventDefault();
            return;
        }
        if (ev.code == "Tab") {
            ev.preventDefault();
            let start = text.selectionStart;
            let end = text.selectionEnd;
            if (start != end) {
                console.log("TODO: range tabbing");
                return;
            }
            // set textarea value to: text before caret + tab + text after caret
            text.value = text.value.substring(0, start) + "\t" + text.value.substring(end);
            // put caret at right position again
            text.selectionStart = start + 1;
            text.selectionEnd = text.selectionStart;
            return;
        }
        if (ev.code == "Enter") {
            ev.preventDefault();
            let start = text.selectionStart - 1;
            while (start > 0 && text.value[start] != '\n') {
                start -= 1;
            }
            start += 1;
            let tabs = 0;
            while (text.value[start] == '\t') {
                tabs += 1;
                start += 1;
            }
            start = text.selectionStart;
            let end = text.selectionEnd;
            text.value = text.value.substring(0, start) + "\n" + "\t".repeat(tabs) + text.value.substring(end);
            text.selectionStart = start + tabs + 1;
            text.selectionEnd = text.selectionStart;
            return;
        }
    };
}
