/**
* @syntax <install/update/uninstall> <pkgId>
* @description apt package manager for UDN.
*/
if (!isRoot) return termAPI.write('apt: You need root permissions to run this command.');

let args = termAPI.getArguments(line);

let repo = "https://udn-apprepo.tbsharedaccount.repl.co"

function fetchlog(url,display=null) {
	termAPI.write(`fetch: fetching ${display ? display : url}\r\n`);
	return fetch(url);
}

if (!args[0] || args[0].match(/-h|--help/)) {
	return termAPI.write(termAPI.toCRLF`apt - udn package manager
usage:
	apt <subcommand> <...>
subcommands:
	install <packageId> - installs a package
	update <packageId> - updates a already installed package
	uninstall <packageId> - uninstall a package
	meta, metadata, -m <packageId> - shows the metadata(name, desc, etc) of a package
	search <...query> - searches`)
}
async function installPkg(appId,update=false) {
	let appUrl = `${repo}/app/${appId}`
	// check if the app exists
	let manifest_response = await fetch(`${appUrl}/manifest.json`);
  let statsus = manifest_response.status;
  if (appId === "apt") return termAPI.write(`apt: you ducked up!`);
  if (statsus === 404) return termAPI.write(`apt: 404: There is no app with the id of: "${appId}"`);
  if (statsus >= 500) return termAPI.write(`apt: 5xx: server ducked up!`);
  if (statsus >= 400) return termAPI.write(`apt: 4xx: something ducked up!`);
	// if (manifest_response.status !== 200) {
	// 	return termAPI.write(`apt: 404: There is no app with the id of: "${appId}"`);
	// }
	
	let manifest = await manifest_response.json();
	termAPI.write(`apt: Installing "${manifest.name}" ...\r\n`);
	if (!manifest.terminalapp) return termAPI.write('apt: Sorry, only terminal apps are supported at the moment.\r\n');
	let entrypoints = [];
	
	let pkgpath = `/pkg/${appId}`;
	if (Array.isArray(manifest.cli)) {
		for (let cli_command of manifest.cli) {
			let entrypoint = await fetchlog(`${appUrl}/${cli_command.entrypoint}`, cli_command.entrypoint);
			if (entrypoint.status !== 200) return termAPI.write('fetch: unable to fetch entrypoint, installation aborted.\r\n');
			let ep_path = path.join(pkgpath, cli_command.entrypoint);
			console.log(ep_path)
			let entrypoint_text = await entrypoint.text();
			entrypoints.push({response: entrypoint, text: entrypoint_text, command: cli_command.command, path: ep_path});
		}
	} else {
		let entrypoint = await fetchlog(`${appUrl}/${manifest.cli.entrypoint}`, manifest.cli.entrypoint);
		if (entrypoint.status !== 200) return termAPI.write('fetch: unable to fetch entrypoint, installation aborted.\r\n');
		let entrypoint_text = await entrypoint.text();
		entrypoints.push({response: entrypoint, text: entrypoint_text, command: manifest.cli.command});
	}
	let extraFiles = [];
	
	if (manifest.files.length > 0) {
		termAPI.write('fetch: fetching additional required files...\r\n');
		for (let file of manifest.files) {
			let file_response = await fetchlog(appUrl+path.join("/", file.url), file.filename);
			if (file_response.status !== 200) {
				return termAPI.write(`fetch: unable to fetch required file "${file}", installation aborted.\r\n`);
			}
			let file_data = null;
			if (file.type === "text") file_data = await file_response.text();
      //if (file.type === "json") file_data = await file_response.json();
			if (file.type === "arr") {
				let arrBuf = await file_response.arrayBuffer();
				let arrInt = new Uint8Array(arrBuf);
				let arr = new Array();
				arr.push(...arrInt);
				file_data = JSON.stringify(arr);

			}
			if (file.type === "binary") {
				let arrBuf = await file_response.arrayBuffer();
				file_data = arrBuf;
			}
			extraFiles.push({
				filename: file.filename,
				data: file_data,
				type: file.type,
        path: file.path || pkgpath
			});
		}
	}
	termAPI.write("apt: all files have been downloaded successfully, installing...\r\n");
	let manifest_path = path.join(pkgpath, "./manifest.json");
	
	termAPI.write("fs: writing manifest to disk...\r\n");
	await localforage.setItem(manifest_path, JSON.stringify(manifest));
	termAPI.write("fs: writing entrypoint(s) to disk...\r\n");
	for (let command of entrypoints) {
		await localforage.setItem(command.path, command.text);
	}
	
	for (let file of extraFiles) {
		termAPI.write(`fs: writing "${file.filename}" to disk...\r\n`);
		await localforage.setItem(
			path.join(file.path, file.filename),
			file.data
		);
	}
	for (let command of entrypoints) {
		commands[command.command] = {text: command.text, pkgId: appId};
	}
	if (manifest.module?.path) {
		termAPI.write(`fs: writing "${manifest.module.path}" to disk...\r\n`);
		await localforage.setItem(
			path.join(pkgpath, manifest.module.path), 
			await (await fetch(
				`${appUrl}/${manifest.module.path}`
			)).text()
		);
	}
	let mdep = manifest.dependencies;
	if (mdep) {
		termAPI.write(`apt: Installing ${mdep.length} ${mdep.length > 1 ? "dependencies" : "dependency"}...\r\n`);
		for (let dep of mdep) {
			if (await localforage.getItem(`/pkg/${dep}/manifest.json`) && !update) {
				termAPI.write(`apt: ${dep} is already installed, skipping...\r\n`);
				continue;
			}
			let depinst = await installPkg(dep);
			termAPI.write(`apt: Installed ${dep} dependency.\r\n`);
		}
		termAPI.write('apt: successfully installed all the required dependencies\r\n');
	}
	// add to startup
	if (manifest.startup) {
		let startupFileReq = await fetch(appUrl+path.join('/',manifest.startup));
		let startupFile = await startupFileReq.text();
		termAPI.OSComms.setStorageKey(`$downloadedApp$${appId}`,startupFile);
		top.postMessage({
			action: 'evalPy',
			code: startupFile+"\nsetupApps()"
		},'*');

	}
	return {
		addedCommands: entrypoints.map(x => x.command),
		manifest
	}
}
if (args[0] === "install") {
	let appId = args[1];

	if (!appId) return termAPI.write('apt: You need to specify an app id!');
	if (await localforage.getItem(`/pkg/${appId}/manifest.json`)) return termAPI.write('apt: error: This application is already installed!');

	let mainPkg = await installPkg(appId);
	//commands[manifest.cli.command] = entrypoint_text;
	termAPI.write(`apt: ${mainPkg.manifest.name} has been successfully installed!\r\n`)

	termAPI.write(`apt: The following commands have been added:\r
${mainPkg.addedCommands.join('\r\n').replace(/,/g,"")}`);
}
if (args[0] === "update") {
	let appId = args[1];

	if (!appId) return termAPI.write('apt: You need to specify an app id!')
	if (!await localforage.getItem(`/pkg/${appId}/manifest.json`)) return termAPI.write('apt: error: This application is not installed!');

	let mainPkg = await installPkg(appId,true);
	//commands[manifest.cli.command] = entrypoint_text;
	termAPI.write(`apt: ${mainPkg.manifest.name} has been successfully updated!\r\n`)

	termAPI.write(`apt: The following commands have been added:\r
${mainPkg.addedCommands.join('\r\n').replace(/,/g,"")}`);
}
if (args[0] === "uninstall") {
	let appId = args[1];

	if (!appId) return termAPI.write('apt: You need to specify an app id!\r\n')

	if (!await localforage.getItem(`/pkg/${appId}/manifest.json`)) return termAPI.write('apt: 404: This application is not installed!\r\n');

	termAPI.write(`apt: uninstalling ${appId}...\r\n`);

	termAPI.write("apt: uninstall: looking for application installation files...\r\n");

	let manifest = JSON.parse(await localforage.getItem(`/pkg/${appId}/manifest.json`))

	let files = (await localforage.keys()).filter(x => x.startsWith(`/pkg/${appId}/`));

	termAPI.write(`apt: uninstall: found ${files.length} files to remove\r\n`);

	for (let file of files) {
		await localforage.removeItem(file);
		termAPI.write(`apt: uninstall: removed ${file}\r\n`)
	}
	termAPI.write('apt: removing startup files... (if it has one)\r\nif this application DOES have a startup file a reboot may be needed.\r\n');
	termAPI.OSComms.removeStorageKey(`$downloadedApp$${appId}`);
	// termAPI.write('pkg: uninstall complete, rebooting...\r\n');
	if (Array.isArray(manifest.cli)) {
		for (let command of manifest.cli) {
			delete commands[command.command];
		}
	} else {
		if (commands[manifest.cli.command]) {
			delete commands[manifest.cli.command];
		}
	}
	
	termAPI.write(`apt: ${appId} has been successfully uninstalled!\r\n`)


	//location.reload();
}
if (args[0].match(/meta|metadata|-m/)) {
	let appId = args[1];
	
	if (!appId) return termAPI.write('apt: You need to specify an app id!')

	let appUrl = `${repo}/app/${appId}`

	termAPI.write('apt: fetching app...\r\n')
	let manifest_response = await fetch(`${appUrl}/manifest.json`);
	if (manifest_response.status !== 200) {
		return termAPI.write(`apt: 404: There is no app with the id of: "${appId}"`);
	}
	
	let manifest = await manifest_response.json();
	
	termAPI.write(`name: ${manifest.name}\r
required files: ${manifest.files.map(x => x.filename).join(', ')}\r
description:\r
${manifest.description.replace(/\n/g,"\r\n")}`);

}
if (args[0] === "search") {
	termAPI.write("name (id) - description\r\nSearching please wait...\r\n\r\n")
	let query = args.slice(1).join(' ');

	let searchResults = await (await fetch(`${repo}/search?q=${escape(query)}`)).json();

	for (let result of searchResults) {
		termAPI.write(`${result.name} (${result._id}) - ${termAPI.toCRLF(result.description)}\r\n`);
	}
}