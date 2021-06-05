namespace template {

	type opInfo = {
		name: string
		ins: number[]
	}

	function createOpInfo(name: string, ins: number[] = []): opInfo {
		return {
			name: name,
			ins: ins,
		}
	}
	export let all: {[key: string]: opInfo[]} = {
		"minimal": [
			createOpInfo("gray"),
			createOpInfo("laplaceB", [0]),
			createOpInfo("edgeValue", [1]),
			createOpInfo("threshhold", [2]),
			createOpInfo("inverse", [3]),
		],
		"canny": [
			createOpInfo("gray"),
			createOpInfo("blurr3", [0]),
			createOpInfo("sobelX", [1]),
			createOpInfo("sobelY", [1]),
			createOpInfo("edgeValue", [2]),
	
			createOpInfo("edgeValue", [3]),
			createOpInfo("euclidean", [4, 5]),
			createOpInfo("grad", [2, 3]),
			createOpInfo("suppression", [6, 7]),
			createOpInfo("threshhold", [8]), //hysteresis in original algorithmus

			createOpInfo("inverse", [9]),
		],
		"simple": [
			createOpInfo("nothing"),
			createOpInfo("robertsA", [0]),
			createOpInfo("robertsB", [0]),
			createOpInfo("edgeValue", [1]),
			createOpInfo("edgeValue", [2]),

			createOpInfo("max", [3, 4]),
			createOpInfo("grayMax", [5]),
			createOpInfo("threshhold", [6]),
			createOpInfo("inverse", [7]),
		],
	}
}
