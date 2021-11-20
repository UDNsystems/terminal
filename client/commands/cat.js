/**
* @syntax <file>
* @description prints the content of a file
*/
let args = termAPI.getArguments(line);
if (args[0] === "cat") return termAPI.write('sus');
let folder = termAPI.getDirectory();
let filepath = termAPI.resolvePath(folder, args[0]);

let content = await termAPI.fs.get(filepath);

if (!content) {
	return termAPI.write('cat: The specified file doesn\'t exist!');
}

if (typeof content !== "string") {
	return termAPI.write('cat: Unable to read file, are you sure the file isn\'t a binary?')
}

const LINE_ENDINGS = {CRLF: 23, LF: 10}
// termAPI.write(content);
function getLineEnding(text) {
	if (text.includes('\r\n')) return LINE_ENDINGS.CRLF;
	return LINE_ENDINGS.LF;
}

function convertToCRLF(text) {
	return text.replace(/\n/g,"\r\n");
}

let lineEnding = getLineEnding(content);

if (lineEnding === LINE_ENDINGS.LF) {
	content = convertToCRLF(content);
}

termAPI.write(content);
// 