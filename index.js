let express = require("express");

let ngrok =  require('ngrok');

let app = express();
let FitbitApiClient = require("fitbit-node");
let config = require("./fitbit_credentials.json");

let client = new FitbitApiClient(config);
let ngrok_endpoint

//redirect to fitbit authorization page
app.get("/authorize", (req, res) => {
  console.log("ngrok: "+ngrok_endpoint);
  res.redirect(client.getAuthorizeUrl('activity heartrate location profile settings sleep social weight', ngrok_endpoint));
});

app.get("/callback", (req, res) => {
  console.log("Callback URI called")
  client.getAccessToken(req.query.code, ngrok_endpoint).then(results => {
    client.get("/profile.json", result.access_token).then(results => {
      res.send(results[0])
    }).catch(res.send)
  }).catch(res.send);
});

app.listen(3000, () => {
  ngrok.connect(3000, (err, url) =>{
    if (err) {
      return console.log(err);
    }
    console.log(`Server startet, auth URI is ${url}/authorize`);
    ngrok_endpoint = url+"/callback";
  })
});
