import os
import re

config = open('shaders.ts', "w")
config.write("""/** automatic generated shader data */
namespace shaders {
	export let all: { [key: string]: string } = {
""")

def dirCrawler(path):
	return dirCrawlerSub(path, [])

def dirCrawlerSub(path, res):
	for f in os.listdir(path):
		if os.path.isdir(path + f):
			dirCrawlerSub(path + f + "/", res)
		else:
			res.append(path + f)
	return res

for f in dirCrawler("shaders/"):
	if len(f) > 5 and f[-5:] == ".glsl":
		name = f.split("/")[-1][:-5]
		data = open(f).read()
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

for f in dirCrawler("./"):
	if len(f) > 3 and f[-3:] == ".ts":
		out.write('<script type="text/javascript" src = "'+ f[2:-3] +'.js"></script>\n')
out.write("</html>")
out.close()
