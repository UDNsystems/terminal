/**
 * @syntax 
 * @description Removes a file.
 */
let [filename] = termAPI.getArguments(line);
let dir = termAPI.getDirectory();

let filepath = termAPI.resolvePath(dir, filename);

termAPI.fs.del(filepath);
