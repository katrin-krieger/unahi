let express = require("express");
require('dotenv').load();
let dateformat = require('dateformat');

let ngrok =  process.env.ENABLE_TUNNEL ? require('ngrok') : false;

let bodyParser = require('body-parser')

let app = express();
app.use(bodyParser.json())

let FitbitApiClient = require("fitbit-node");
let config = require("./fitbit_credentials.json");

let client = new FitbitApiClient(config);
let endpoint, access_token;

//redirect to fitbit authorization page
app.get("/authorize", (req, res) => {
  console.log("ngrok: " + endpoint);
  res.redirect(client.getAuthorizeUrl('activity heartrate location profile settings sleep social weight', endpoint));
});

app.get("/callback", (req, res) => {
  console.log("Callback URI called")
  client.getAccessToken(req.query.code, endpoint).then(result => {
		// use the access token to fetch the user's profile information
    access_token = result.access_token;
		client.get("/profile.json", access_token).then(results => {
			res.send(results[0]);
		}).catch(err => {
			res.status(err.status).send(err);
		});
	}).catch(err => {
		res.status(err.status).send(err);
  });
});

app.post("/sendWeightData", (req, res) => {
  let weight = req.body.weight;
  client.post("/body/log/weight.json", access_token, {
    "weight": weight,
    "date": dateformat(res.request_date,"yyyy-mm-dd")
  }).then(result => {
    res.send(result[0]);
    console.log(JSON.stringify(req.body));
    console.log("Trying to send weight data to fitbit: ")
    console.log(`submitted weight: ${weight}`);
  }).catch(err => {
    console.log("ERROR!" +err)
    res.status(err.status).send(err);
  });
});

app.listen(3000, () => {
  if (ngrok){
    console.log("Starting server via tunnel")
    ngrok.connect(3000, (err, url) =>{
      if (err) {
        return console.log(err);
      }
      console.log(`Server startet, auth URI is ${url}/authorize`);
      endpoint = url+"/callback";
    });
  }
  else {
    //start normally
    console.log("unahi started on localhost")
    endpoint = "https://3d2a6fea.ngrok.io/callback"
  }

});
