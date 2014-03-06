var moment = require('moment')
var dashdash = require('dashdash')
var https = require('https')
var async = require('async')
var fs = require('fs')

var options = [
  {
    names: ['user','u'],
    type: 'string'
  },
  {
    names: ['password','pass','p'],
    type: 'string'
  },
  {
    names: ['organization','o'],
    type: 'string'
  },
  {
    names: ['channel','c'],
    type: 'string'
  },
  {
    names: ['start','s'],
    type: 'string'
  },
  {
    names: ['end','e'],
    type: 'string'
  }
]
var opts = dashdash.parse({options: options});

var httpOpts = {
  host: 'grove.io',
  port: 443,
  // authentication headers
  headers: {
    'Authorization': 'Basic ' + new Buffer(opts.user + ':' + opts.password).toString('base64')
  }
}

// generate the list of dates
var startDate = moment(opts.start)
var endDate = moment(opts.end)
var dates = []
do {
  dates.push(startDate.format('YYYY-MM-DD'))
  startDate.add('days',1)
} while(startDate.isBefore(endDate))

// fetch them all in parallel (at most 10 concurrently)
// and assemble them into a giant array
async.mapLimit(
  dates,
  10,
  // run on each
  function(item,cb) {
    var date = item.split('-')
    var options = {
      host: httpOpts.host, port: httpOpts.port, headers: httpOpts.headers,
      path: '/archives/'+opts.organization+'/'+opts.channel+'/'+date[0]+'/'+date[1]+'/'+date[2]+'.json'
    }

    var request = https.get(options, function(res){
      var body = ''
      res.on('data', function(data) {
        body += data
      })
      res.on('end', function() {
        //here we have the full response, html or json object
        cb(null,body)
      })
      res.on('error', function(e) {
        console.log("Got error: " + e.message)
      })
    })

  },
  // run when all callbacks complete
  function(er,results) {
    var filename = opts.organization+'-'+opts.channel+'-'+opts.start+'-'+opts.end+'.log'
    fs.writeFile(filename,JSON.stringify(results),function(er) {
      console.log("Wrote " + filename)
    })
  }
)