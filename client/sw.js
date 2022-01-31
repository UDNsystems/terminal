// activate immediately:
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
let tempUrls = {};
let expireTime = 60 * 1000
self.addEventListener('message',(ev) => {
	let request = ev.data.request;
	let body = ev.data.body;

	if (request === "createTemporaryURL") {
		let expiresOn = Date.now() + expireTime;
		tempUrls[body.path] = {content: body.content, expires: expiresOn, mimeType: body.mimeType};
		console.log('[termsw] creating temporary url:',body.path);
	}
})
function sendMessage(client, msg) {
	return new Promise(resolve => {
		let messageId = Math.floor(Math.random() * 99999999);
		let handler = function(ev) {
			if (ev.data.replyTo === messageId) {
				self.removeEventListener('message', handler);
				resolve(ev.data.response);
			}
		}
		self.addEventListener('message', handler);
		let data = {messageId, request: msg};
		client.postMessage(data);
	})
}
self.addEventListener('fetch',e => {
  const url = new URL(e.request.url);
	if (tempUrls[url.pathname]) {
		return e.respondWith(new Promise(resolve => 
				resolve(
					new Response(tempUrls[url.pathname].content, {
						status: 200,
						headers: {
							'Content-Type': tempUrls[url.pathname].mimeType
						}
					})
				)
			)
		);
	}
  if (url.pathname !== '/term-internals/prompt') return;
  e.respondWith(new Promise(async resolve => {
		const client = await clients.get(e.clientId);
    //const q = new URLSearchParams(url.search).get('q');
		let userInput = await sendMessage(client, {get: 'stdin', q: ''});
    const response = new Response(userInput, {status:200});
    resolve(response);
  }));
});
setInterval(() => {
	console.log('[termsw] expired temp urls clean up...');
	for (let url in tempUrls) {
		let data = tempUrls[url];
		if (Date.now() > data.expires) {
			console.log('[termsw] cleaning up:',url,'expired:',((Date.now()-data.expires)/1000),'seconds ago');
			delete tempUrls[url];
		}
	}
}, expireTime)