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
            let sep = file.name.split(".");
            let format = sep[sep.length - 1];
            switch (format) {
                case "png":
                case "jpg":
                case "jpeg":
                case "jfif":
                    await AddTexture(file);
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
async function AddTexture(file) {
    img.src = URL.createObjectURL(file);
    let texture = await Texture.FromImage(img);
    textures.push(texture);
    let button = document.createElement("div");
    button.className = "button";
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
        }
        else {
            img.src = URL.createObjectURL(file);
        }
    };
    Output.Update(Text.text.value);
}
