let args = termAPI.getArguments(line);
let folder = termAPI.getDirectory();
let filepath = termAPI.resolvePath(folder, args[0]);

termAPI.fs.set(filepath, args.slice(1).join(' '));
//.replace("\\NL","\n")
