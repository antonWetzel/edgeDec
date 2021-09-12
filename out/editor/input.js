import * as Texture from '../gpu/texture.js';
import * as Output from './output.js';
import * as Text from './text.js';
export let textures;
let buttons;
let add;
let img;
export function Setup() {
    textures = [];
    let input = document.getElementById("input");
    img = input.children[0];
    buttons = document.getElementById("inputButtons");
    add = buttons.children[0];
    add.onclick = () => {
        let input = document.createElement("input");
        input.type = "file";
        input.accept = 'image/png,image/jpeg,video/mp4,video/webm';
        input.onchange = async () => {
            let files = input.files;
            if (files == null || files.length == 0) {
                return;
            }
            let file = files[0];
            let sep = file.name.lastIndexOf(".");
            let format = file.name.substring(sep + 1);
            let name = file.name.substring(0, sep);
            switch (format) {
                case "png":
                case "jpg":
                case "jpeg":
                case "jfif":
                    await AddTexture(file, name);
                    break;
                case "mp4":
                case "webm":
                case "m4v":
                    alert("TODO: video");
                    break;
                default:
                    alert("format '" + format + "' not supported");
                    break;
            }
        };
        input.click();
    };
}
async function AddTexture(file, name) {
    img.src = URL.createObjectURL(file);
    let texture = await Texture.FromImage(img);
    textures.push(texture);
    let button = document.createElement("div");
    button.className = "button";
    button.innerText = name;
    add.insertAdjacentElement("beforebegin", button);
    button.onclick = (ev) => {
        if (ev.ctrlKey) {
            img.src = "";
            for (let i = 0; i < textures.length; i++) {
                if (textures[i] == texture) {
                    textures.splice(i, 1);
                    break;
                }
            }
            button.remove();
            Output.Update(Text.text.value);
        }
        else {
            img.src = URL.createObjectURL(file);
        }
    };
    Output.Update(Text.text.value);
}
