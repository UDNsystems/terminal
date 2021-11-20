let cmdInfoRegex = /\/\*\*\t?\n ?\* @syntax (?<syntax>.*)\n ?\* @description (?<desc>.*)\n ?\*\//;
let helpText = "Terminal commands help:\n";
for (let command in commands) {
	if (typeof commands[command] === "string") {
		let cmdhelp = commands[command].match(cmdInfoRegex)?.groups;
		if (!cmdhelp) continue;
		helpText += `\t${command} ${cmdhelp.syntax} - ${cmdhelp.desc}\n`;
	} else {
		let cmdhelp = commands[command].text.match(cmdInfoRegex)?.groups;
		if (!cmdhelp) continue;
		helpText += `\t${command} ${cmdhelp.syntax} - ${cmdhelp.desc}\n`;
	}
}

termAPI.write(termAPI.toCRLF(helpText));
/*
termAPI.write(
	termAPI.toCRLF`Terminal help:
	cat <file> - displays the contents of a file
	cd <relative path> - switches to another directory
	clear - clears the terminal
	help - shows this
	time - shows a local time
	date - shows a local date
	echo - repeats the word
	ls - lists contents of a directory
	touch <file> - creates a blank file
	write <file> <...content> - writes <...content> to the specified file
	reboot - reboots your OS
	username <username> - sets your username
	reload - reloads all commands
	language <language> - changes your system language (reboot required)
	rm <file> - removes a file(folders don't work yet)
	stuck - use this if you become stuck at an unaccesible folder
	halp - misspell of help
	termtest <testName> [arg] - runs a terminal test
	evalpy <code> - evals python (broken)
	pcsystem - you forgor 💀
	sudo <...command> - runs a command as root
	`
)*/
// very cool 👍
