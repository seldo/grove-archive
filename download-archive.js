var moment = require('moment')
var dashdash = require('dashdash')
var https = require('https')

var options = [
  {
    names: ['user','u'],
    type: 'string'
  },
  {
    names: ['password','pass','p'],
    type: 'string'
  }
]
var opts = dashdash.parse({options: options});

var httpOpts = {
  host: 'grove.io',
  port: 443,
  path: '/archives/npm/npm/2014/3/5.json',
  // authentication headers
  headers: {
    'Authorization': 'Basic ' + new Buffer(opts.user + ':' + opts.password).toString('base64')
  }
}

request = https.get(httpOpts, function(res){
  var body = ''
  res.on('data', function(data) {
    body += data
  })
  res.on('end', function() {
    //here we have the full response, html or json object
    console.log(body)
  })
  res.on('error', function(e) {
    console.log("Got error: " + e.message)
  })
})

// https://grove.io/archives/npm/npm/2014/3/5.json