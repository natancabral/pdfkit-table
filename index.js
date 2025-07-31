var http = require('http')
var corsify = require('corsify')
var config = require('./config')
var staticland = require('./lib/server')(config)

var cors = corsify({
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': config.clientHost,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
})

var https = require('https'); // Added to replace http with https
var fs = require('fs'); // Added to read SSL certificate files

var options = {
  key: fs.readFileSync('path/to/your/private-key.pem'), // Path to private key
  cert: fs.readFileSync('path/to/your/certificate.pem') // Path to certificate
};

https.createServer(options, cors(staticland)).listen(config.port, function () {
  console.log('listening on 127.0.0.1:' + config.port)
})