// app specific service worker logic
self.addEventListener('message', async event => {
	// user taps on sw update toast
	if (event.data === 'skip-waiting') {
		self.skipWaiting();
		// current tab will refresh once this sw has
		// taken over control via the 'controllerchange' event
		// tell other open tabs to reload via post message
		self.clients.claim();
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage('waiting-skipped'));
	}
});
