let [testName, optionalArg] = termAPI.getArguments(line);

const tests = {
	impossibleFolder(path) {
		termAPI.setDirectory(path);
	},
	hostnameChange(hostn) {
		termAPI.setHostname(hostn);
	}
};

tests[testName](optionalArg);