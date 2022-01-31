if ('serviceWorker' in navigator) {
	if (!navigator.serviceWorker.controller) {
		navigator.serviceWorker.register("./sw.js");
	}
}
navigator.serviceWorker.addEventListener('message',async (ev) => {
	console.log(ev)
	const req = ev.data.request;
	const mid = ev.data.messageId;

	if (req.get === "stdin") {
		ev.source.postMessage({replyTo: mid, response: await termAPI.prompt(req.q)});
	}
})
localforage.config({
    driver      : localforage.INDEXEDDB,
    name        : 'terminalInternalStorage',
    version     : 1.0,
    storeName   : 'terminalInternalStorage', // Should be alphanumeric, with underscores.
    description : 'Used for storing internal terminal stuff like packages'
});
var term = new Terminal();
var fitAddon = new FitAddon.FitAddon()
term.loadAddon(fitAddon)
term.open(document.body);
fitAddon.fit();
let username = localStorage.getItem('username') || "user";
let hostname = localStorage.getItem('hostname') || "UDNSYS";
let prompt1 = `${username}@${hostname}`;
let fakeDir = "/"
let version = "0.2.4-alpha"
let abortDuck = new AbortController();

let commandList;
let commands = {};

(async()=>{
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
	// load apps
	let apps = (await localforage.keys()).filter(x => x.startsWith('/pkg/') && x.endsWith('manifest.json'));
	console.log(apps, await localforage.keys())
	if (apps.length > 0) {
		termAPI.write('Loading apps...\r\n');
		for (let app of apps) {
			console.log('loading app',app)
			let manifest = JSON.parse(await localforage.getItem(app));
			let appFolderPath = app.replace('manifest.json','');
			if (Array.isArray(manifest.cli)) {
				for (let command of manifest.cli) {
					let entrypoint = path.join(appFolderPath,command.entrypoint);

					let entrypoint_data = await localforage.getItem(entrypoint);

					commands[command.command] = {text: entrypoint_data, pkgId: app.match(/\/pkg\/(.*)\/manifest.json/)[1]};

					term.write(`Loaded up "${command.command}" into memory\r\n`);
				}
			} else {
				let entrypoint = path.join(appFolderPath,manifest.cli.entrypoint);

				let entrypoint_data = await localforage.getItem(entrypoint);

				commands[manifest.cli.command] = {text: entrypoint_data, pkgId: app};

				term.write(`Loaded up "${manifest.cli.command}" into memory\r\n`);

			}
			
		}
	}

	term.write('\x1b[0;0H')
	term.write('\x1b[0J');
  term.clear();

	term.write(`UDN Systems [version ${version}]\r\n\x1b[92m${prompt1}\x1b[0m:\x1b[94m${fakeDir}\x1b[0m$ `);
})();



function calculateLineStart() {
	return `${prompt1}:${fakeDir}$ `.length
}
let text = "";

let backspaces = 0;

let lineHandler = async (text) => {
	let res = processLine(text);
    try {
		  if (res instanceof Promise) await res;
    } catch (ducks) {
      var ducc = ducks.stack || ducks;
      term.write('\x1b[0;31mError: '+ ducc.replace(/\n/g, '\r\n'));
			console.error(ducks);
    }
		term.write(`\r\n\x1b[92m${prompt1}\x1b[0m:\x1b[94m${fakeDir}\x1b[0m$ `)
};
let lineHandler_copy = lineHandler;

term.onKey(async key => {
	console.log(JSON.stringify(key),key)
	const code = key.key.charCodeAt(0);
    if(code == 127){   //Backspace
				//if (backspaces >= text.length) return;
				if (text.length === 0) return console.log(text.length);
        term.write("\b \b");
				backspaces++;
				(() => {
					let texttmp = text.split('');
					texttmp.pop();
					text = texttmp.join('');
				})();
				return;
    }
	if (key.key === "\t") {
		return; // not implemented tab yet
	}
	if (key.key === "\x1B[A") {
		return;
	}
	if (key.key === "\x16") {
		let clipboardText = await navigator.clipboard.readText();
		text += clipboardText;
		return term.write(clipboardText);
	}
	if (key.key === "\r") {
		term.write("\r\n");
		await lineHandler(text);
		text = "";
		backspaces = 0;
	} else {
		term.write(key.key)
		text += key.key;
	}
	if (key.key === "\x03") {
		term.write("^C");
		abortDuck.abort();
	}
	
})

// function runCommand(name,line) {
// 	return fetch(`/commands/${name}.cmd`)
// 		.then(x => x.text())
// 		.then(x => cmdLangInterpreter(x));
// }
let OSComms = {
	getStorageKeys() {
		/*return new Promise((resolve) => {
			top.postMessage({action: 'storageGetKeys'},"*");
			let ogDuck = window.onmessage;
			window.onmessage = function(ev) {
				if (ev.data.action === "storageGetKeys") {
					window.onmessage = ogDuck;
					resolve(ev.data.data);
				}
			}
		})*/
    term.write('WARN: OSComms.getStorageKeys() is deprecated and may not work properly\r\n');
    return OSRequest('LIST','localStorage')
    //prevent packages from ducking up
	},
	getStorageKey(key) {
		/*return new Promise((resolve) => {
			top.postMessage({action: 'getStorageKey', data: key},"*");
			let ogDuck = window.onmessage;
			window.onmessage = function(ev) {
				if (ev.data.action === "getStorageKey") {
					window.onmessage = ogDuck;
					resolve(ev.data.data);
				}
			}
		})*/
    term.write('WARN: OSComms.getStorageKey() is deprecated and may not work properly\r\n');
    return OSRequest('GET', 'localStorage', key);
    //prevent packages from ducking up
	},
	setStorageKey(key, value) {
		//top.postMessage({action: 'setStorageKey', key, value}, "*");
    term.write('WARN: OSComms.setStorageKey() is deprecated and may not work properly\r\n');
    return OSRequest('POST', 'localStorage', {key, value})
    //prevent packages from ducking up
	},
	reboot() {
		top.postMessage({action: 'evalJS', code: 'location.reload();'},"*")
    term.write('WARN: OSComms.reboot() is deprecated and may not work properly\r\n');
	},
	removeStorageKey(key) {
    term.write('WARN: OSComms.removeStorageKey() is deprecated and may not work properly\r\n');
		top.postMessage({action: 'removeStorageKey', key}, "*");
	},
	openIframe(url, title, width, height) {
    term.write('WARN: OSComms.openIframe() is deprecated and may not work properly\r\n');
		top.postMessage({event: 'openIframe', title, url, width, height}, "*")
	},
	shutdown() {
    term.write('WARN: OSComms.shutdown() is deprecated and may not work properly\r\n');
		top.postMessage({
			action: 'shutdown'
		},'*')
	}
}
let termAPI = {
	OSComms,
	write: (...data) => term.write(...data),
	getDirectory: () => fakeDir,
	setDirectory: (fullLocation) => fakeDir = fullLocation,
	async setDirectoryRelative(location) {
		function addSlashIfThereIsntAny(text) {
			if (!text.endsWith('/')) return text+"/";
			return text;
		}
		if (fakeDir.startsWith('/home/')) {
			let storageKeys = await OSComms.getStorageKeys()
			let splitPath = location.split('/');
			let resolvedPath = path.resolve(fakeDir, location);
			let exists = ((location, keys) => {
				for (let key of keys) {
					if (key.startsWith(location)) {
						return true;
					}
				}
				return false;
			})(resolvedPath, storageKeys);
			if (location === "/") return fakeDir = "/";
			if (location === "..") return fakeDir = addSlashIfThereIsntAny(resolvedPath);
			if (!exists) throw new Error('This directory doesn\'t exist!');
			console.log(resolvedPath);
			
			fakeDir = resolvedPath+"/";
		} else {
			let storageKeys = await localforage.keys();
			storageKeys.push('/home/nul') // dummy home directory
			let splitPath = location.split('/');
			let resolvedPath = path.resolve(fakeDir, location);
			let exists = ((location, keys) => {
				for (let key of keys) {
					if (key.startsWith(location)) {
						return true;
					}
				}
				return false;
			})(resolvedPath, storageKeys);
			if (!exists) throw new Error('This directory doesn\'t exist!');
			console.log(resolvedPath);
			if (location === "/") return fakeDir = "/";
			if (location === "..") return fakeDir = addSlashIfThereIsntAny(resolvedPath);
			fakeDir = resolvedPath+"/";
		}
		
	},
	resolvePath(x, y) {
		return path.resolve(x, y);
	},
	getArguments(line) {
		return line.trimStart().split(/ +/).slice(1);
	},
	toCRLF(...ducks) {
		return ducks.map(x => x.toString().replace(/\n/g,"\r\n")).join('');
	},
	getHostname: () => hostname,
  getUsername: () => username,
	commands,
	commandList,
  clear: () => { term.write('\x1b[0;0H'); term.write('\x1b[0J'); term.clear(); },
	getVersion: () => version,
  setUsername: susname => { 
    let duck = susname.trim();
    if (duck.length < 3) throw "username ducked up";
    if (!/^\w+$/.test(duck)) throw "username ducked up";
    localStorage.setItem('username', duck); 
		username = duck; 
		location.reload();
    return duck; 
  },
	setHostname: susname => { 
    let duck = susname.trim();
    if (duck.length < 5) throw "hostname ducked up";
    if (!/^\w+$/.test(duck)) throw "hostname ducked up";
    localStorage.setItem('hostname', duck); hostname = user; 
    return duck; 
  },
	prompt(txt) {
		return new Promise(resolve => {
			this.write(txt);
			text = "";
			backspaces = 0;
			lineHandler = function(line) {
				lineHandler = lineHandler_copy;
				resolve(line);
			}
		})
	},
	async loadModule(name) {
		let modPkgRaw = await localforage.getItem(`/pkg/${name}/manifest.json`)
		if (!modPkgRaw) throw new Error(`${name} isn't installed!`);
		let modPkg = JSON.parse(modPkgRaw);
		if (!modPkg.module) {
			throw new Error(`${name} isn't a module!`);
		}
		let modPath = path.resolve(`/pkg/${name}/`,modPkg.module.path);
		let modCode = await localforage.getItem(modPath);
		var modObject = {exports: {}};

		let asyncFunction = Object.getPrototypeOf(async function(){}).constructor;
		
		let modFunc = new asyncFunction('module','abortSignal',modCode);
		await modFunc(modObject, abortDuck.signal);

		return modObject.exports;
	},
	async getFileFromPackage(name, relativepath) {
		return await localforage.getItem(
			path.join(`/pkg/${name}/`,relativepath)
		);
	},
	createPkgFS(pkgId) {
		return {
			path_resolve(id,relativepath) {
				return path.join(`/pkg/${id}/`,relativepath);
			},
			async get(filename) {
				return await localforage.getItem(this.path_resolve(pkgId, filename));
			},
			async del(filename) {
				return await localforage.removeItem(
					this.path_resolve(pkgId, filename)
				);
			},
			async set(filename,data) {
				return await localforage.setItem(
					this.path_resolve(pkgId, filename),
					data
				)
			}
		}
	},
	isHomeDirectory() {
		return fakeDir.startsWith('/home/');
	},
	// Filesystem, simplified.
	fs: {
		isHomePath(path) {
			return path.startsWith('/home/');
		},
		get(path) {
			if (this.isHomePath(path)) {
				return OSRequest('GET', 'localStorage', path.slice(5));
			}
			return localforage.getItem(path);
		},
		del(path) {
			if (this.isHomePath(path)) {
				OSComms.removeStorageKey(path);
				return Promise.resolve() // to make sure its a promise
			}
			return localforage.removeItem(path);
		},
		set(path, data) {
			if (this.isHomePath(path)) {
				//OSComms.setStorageKey(path.slice(5), data);
				//return Promise.resolve(); // to make sure its a promise
        return OSRequest('POST', 'localStorage', {key: path, value: data});
			}
			return localforage.removeItem(path);
		},
		async keys() {
			return (await localforage.keys()).concat(
				(await OSRequest('LIST', 'localStorage'))
					.filter(x => x.startsWith('/'))
					.map(x => "/home"+x)
			);
		}
	}
}

function runJSCommand(name,line,pkgName,isRoot=false) {
	abortDuck = new AbortController();
	let asyncFunction = Object.getPrototypeOf(async function(){}).constructor
	let commandData = commands[name];
	var command;
	if (commandData.text) {
		command = commandData.text;
	} else {
		command = commandData;
	}
	return (new asyncFunction("line", "name", "api", "pkgId", "abortSignal", "isRoot", command))(line,name,termAPI, commandData?.pkgId, abortDuck.signal, isRoot);
}

async function processLine(txt) {
	let cmdName = txt.split(/ +/)[0]
	if (!cmdName || !txt) return;
	let command = commands[cmdName];
	if (!command) return term.write(`Unknown or unrecognized command: ${cmdName}`);
	return runJSCommand(cmdName, txt);
}