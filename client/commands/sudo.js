/**	
 * @syntax <...command>
 * @command Run a command as root
 */
let lineWithoutSudo = line.slice(5);
let argduck = lineWithoutSudo.split(' ');
if (!commands[argduck[0]]) return termAPI.write(`Unknown or unrecognized command: ${argduck[0]}`)
await runJSCommand(argduck[0], lineWithoutSudo, null, true)