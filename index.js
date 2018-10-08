/**
 * GET home page
 */
var https = require('https');
var querystring = require('querystring');
const express = require("express");
var parse = require('date-fns/parse')
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static('public'));

const instance = axios.create();
instance.defaults.baseURL = "https://test.oppwa.com/";
instance.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";


let checkoutId;

app.get('/', (req, res) => {
  res.render('pages/index')
})

app.post("/", (req, res) => {
  instance.post("/v1/checkouts", querystring.stringify({
    'authentication.userId':'8a8294175d602369015d73bf00e5180c',
    'authentication.password':'dMq5MaTD5r',
    'authentication.entityId':'8a8294175d602369015d73bf009f1808',
    'amount': req.body.amount,
    'currency': req.body.currency,
    'paymentType':'DB'
  }))
  .then((response) => {
		checkoutId = response.data.id
		res.render("pages/copyandpay", {
			checkoutId
		})
  })
  .catch((error) => {
		res.status(400).send(error.response.statusText)
  })
})



/****
 * Request the status of a request
 */
app.get("/result", (req, res) => {
  generateResult(function(result) {
    if(result != null && result != undefined) {
      res.render('pages/result', {
				message: result.result.description,
				amount: result.amount,
				time: parse(result.timestamp)
      })
    } else {
      res.render('result', 'none')
    }
  })
})


function generateResult(callback) {
	var path=`/v1/checkouts/${checkoutId}/payment`;
	path += '?authentication.userId=8a8294175d602369015d73bf00e5180c';
	path += '&authentication.password=dMq5MaTD5r';
	path += '&authentication.entityId=8a8294175d602369015d73bf009f1808';
	var options = {
		port: 443,
		host: 'test.oppwa.com',
		path: path,
		method: 'GET',
	};
	var postRequest = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			jsonRes = JSON.parse(chunk);
			return callback(jsonRes);
		});
	});
	postRequest.end();
}


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
