/**	
 * @syntax 
 * @description Lists the current directory.
 */
if (termAPI.isHomeDirectory()) {
	let keys = await OSRequest('LIST','localStorage');
	let listing = [];
	let dirDuck2 = termAPI.getDirectory().replace('/home','').split('/');
	function spaceDuck(key) {
		return key.includes(' ') ? `'${key}'` : key;
	}
	function removeCurrentDirFrom(key) {
		return key.slice(termAPI.getDirectory().length)
	}
	keys.forEach(key => {
		if (!key.startsWith('/')) return;
		let dirDuck = key.split('/');
		let dirDuckFilename = dirDuck[dirDuck2.length-1];
		if (dirDuck.length !== dirDuck2.length) {
			return listing.push(`\x1b[34m${spaceDuck(dirDuckFilename)}/\x1b[0m`)
		}
		if (key.startsWith(termAPI.getDirectory().replace('/home/',''))) {
			listing.push(`\x1b[92m${spaceDuck(key.slice(1))}\x1b[0m`)
		}
		
	})
	console.log(listing)
	termAPI.write(listing.join('\r\n'));
} else {
	let keys = await localforage.keys();
	let listing = [];
	let dirDuck2 = termAPI.getDirectory().split('/');
	function spaceDuck(key) {
		return key.includes(' ') ? `'${key}'` : key;
	}
	function removeCurrentDirFrom(key) {
		return key.slice(termAPI.getDirectory().length)
	}
	keys.forEach(key => {
		if (!key.startsWith('/')) return;
		let dirDuck = key.split('/');
		let dirDuckFilename = dirDuck[dirDuck2.length-1];
		if (dirDuck.length !== dirDuck2.length && key.startsWith(termAPI.getDirectory())) {
			let strduc = `\x1b[34m${spaceDuck(dirDuckFilename)}/\x1b[0m`;
			if (listing.includes(strduc)) return;
			return listing.push(strduc)
		}
		if (key.startsWith(termAPI.getDirectory())) {
			let strduc = `\x1b[92m${spaceDuck(removeCurrentDirFrom(key))}\x1b[0m`
			if (listing.includes(strduc)) return;
			listing.push(strduc)
		}
		
	})
	if (termAPI.getDirectory() === "/") listing.push("\x1b[34mhome/\x1b[0m")
	console.log(listing)
	termAPI.write(listing.join('\r\n'));
}