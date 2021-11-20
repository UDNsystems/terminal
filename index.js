const express = require('express');

const app = express();

app.use((req, res, next) => {
	res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
	res.header('Cross-Origin-Resource-Policy', 'cross-origin');
	
	next();
	
},express.static(__dirname+"/client"))

app.listen(3000, () => {
  console.log('server started');
});