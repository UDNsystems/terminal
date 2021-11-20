/**	
 * @syntax <name>
 * @description Creates a new folder
 */
let args = termAPI.getArguments(line);
let folder = termAPI.getDirectory();
let filepath = termAPI.resolvePath(folder, args[0]);

termAPI.OSComms.setStorageKey(filepath+"/.", "");