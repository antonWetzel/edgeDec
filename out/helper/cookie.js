export function Get(name) {
    let values = document.cookie.split(/[;=]/);
    for (let i = 0; i < values.length; i += 2) {
        if (values[i] == name) {
            return values[i + 1];
        }
    }
    return "";
}
export function Set(name, value) {
    let date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * 7); //valid for one week
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString();
}
