force: clean main

main: recursi.nw
	cat $$(readlink $$(which nw)) recursi.nw > recursi
	chmod +x recursi

recursi.nw: index.html $(wildcard js/*) $(wildcard node_modules/*/*) package.json style.css main.js
	zip -r recursi.nw index.html main.js style.css package.json bootstrap/ icons/ images/ js/ node_modules/

clean:
	rm recursi
	rm recursi.nw
