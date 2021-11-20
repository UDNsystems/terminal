let args = termAPI.getArguments(line);
if (args[0] === "--force" || args[0] === "-f") {
	return location.reload();
}
term.write('\x1b[0;0H')
term.write('\x1b[0J');
commandList = await (await fetch("/commandlist.json")).json();
async function loadCommand(command) {
	try {
		let pres = await fetch(`/commands/${command}.js`);
		console.log(pres.status)
		if (pres.status !== 200 && pres.status !== 302) {
			term.write('Unable to load command: '+command+'\r\n');
				return;
	}
			let res = await pres.text();
			commands[command] = res;
			term.write(`Loaded up "${command}.js" into memory\r\n`);
	} catch(err) {
			term.write('Unable to load command: '+command+'\r\n')
	}
		
}
let commandLoads = [];
for (let command of commandList) {
	commandLoads.push(loadCommand(command));
}
await Promise.all(commandLoads);
term.write('\x1b[0;0H')
term.write('\x1b[0J');

term.write(`UDN Systems [version ${termAPI.getVersion()}]\r\n`);
