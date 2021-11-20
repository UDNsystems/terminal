/**
* @syntax <directory>
* @description changes your current directory.
*/
let args = line.slice(3);

await termAPI.setDirectoryRelative(args).catch(x => {termAPI.write(x.toString()); console.error(x)})