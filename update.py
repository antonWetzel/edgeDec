import os
import re

config = open('shaders.ts', "w")
config.write("""namespace shaders {
	export let all: { [key: string]: string } = {
""")
path = "./shaders/"
for f in os.listdir(path):
	if len(f) > 5 and f[-5:] == ".glsl":
		name = f[:-5]
		data = open(path + f).read()
		data = re.sub('[\t\n]', '', data)
		config.write("\t\t" + name + ": \"" + data + "\",\n")

config.write("\t}\n}")
config.close()

out = open("out/main.html", "w")
out.write("""<!DOCTYPE html>
<html style="width: 100%; height: 100%;">


<body style="margin: 0px; width: 100%; height: 100%; border: 0px; overflow: hidden;">
</body>
""")
path = "."
for f in os.listdir(path):
	if len(f) > 3 and f[-3:] == ".ts":
		out.write('<script type="text/javascript" src = "'+ f[:-3] +'.js"></script>\n')
out.write("</html>")
out.close()