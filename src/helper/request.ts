export async function getFile(path: string): Promise<string> {
	return new Promise(
		(resolve, reject) => {
			let request = new XMLHttpRequest()
			request.onreadystatechange = () => {
				if (request.readyState == 4 && request.status == 200) {
					resolve(request.responseText)
				}
			}
			request.open("GET", path)
			request.send()
			setTimeout(reject, 1000, "file timeout")
		}
	)
}
