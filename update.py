import os
import shutil
import re

shutil.copyfile("main.html", "out/main.html")
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