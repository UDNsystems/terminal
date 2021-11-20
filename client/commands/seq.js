/**
 * @syntax <count> [startsWithN]
 * @description Linux seq command
 */
let [count, startsWithN] = termAPI.getArguments(line);

for (let i = 0; i <= count; i++) {
	if (startsWithN) {
		if (!i.toString().startsWith(startsWithN)) continue;
		termAPI.write(`${i}\r\n`);
	} else {
		termAPI.write(`${i}\r\n`);
	}
	
}