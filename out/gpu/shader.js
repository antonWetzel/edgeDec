export async function Load(name) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == 200) {
                resolve(request.responseText);
            }
        };
        setTimeout(reject, 1000, "timeout");
        request.open("GET", "../shaders/" + name + ".wgsl", true);
        request.send();
    });
}
