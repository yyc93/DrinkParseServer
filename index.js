// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

// FOR UPLOADING AWS SERVER THIS IS OPENED. BUT FOR LOCAL THIS IS CLOSED
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

// FOR UPLOADING AWS SERVER THIS IS CLOSED. BUT FOR LOCAL THIS IS OPENED
// var databaseUri = 'mongodb://dbadmin:drinkotonAdmin@ds049276-a0.mlab.com:49276,ds049276-a1.mlab.com:49276/drinkotron?replicaSet=rs-ds049276';

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  oauth: {
   twitter: {
     consumer_key: "PmZ4UCntiAD5d9tMNxy5u0pTO", // REQUIRED
     consumer_secret: "25yg71FF1hYCjfvDvPC3JiBBKvvMQTN9sLDPA26cMvACB1OLnO" // REQUIRED
   },
   facebook: {
     appIds: "684182168316920"
   }
  },
  push: {
    ios: [
      // {
      //   pfx: 'push_drinkotron_dev.p12', // Dev PFX or P12
      //   bundleId: 'com.travis.drinkotron',
      //   production: false // Dev
      // },
      {
        pfx: 'push_drinkotron_dist.p12', // Prod PFX or P12
        bundleId: 'com.travis.drinkotron',  
        production: true // Prod
      }
    ]
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
