var Gun = require('gun');

var config = { port: process.argv[2] || 8765 };

var server = require('http').createServer().listen(config.port);
var gun = Gun({ file: 'db/data.json', web: server, radisk: false, localStorage: true });
console.log('Relay peer started on port ' + config.port + ' with gun');
