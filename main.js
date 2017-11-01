// Requirements
var request        = require("request");
var admin          = require("firebase-admin");
var serviceAccount = require(process.env.FIREBASE_CERT || "SERVICE ACCOUNT PRIVATE KEY");

// Variables
var ionprice       = 0;
var ionPriceUSD    = 0;
var newionprice    = 0;
var newionPriceUSD = 0;
var newionvolume   = 0;
var ionvolume      = 0;
var USDPrice       = 0;

// Initialize Firebase
var config = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_URL || "FIREBASE DATABASE URL"
};

var fireapp = admin.initializeApp(config);

var db = fireapp.database();
var ref = db.ref();

// Firebase variables
var pricebtcRef = ref.child("price-btc");
var priceusdRef = ref.child("price-usd");
var ionvolumeRef = ref.child("volume-ion");

showResult();
function showResult(str) {

    // Get ION price in BTC
    var url = "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ion"

    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            //console.log(body) // Print the json response
            newionprice  = body.result[0].Last
            newionprice  = newionprice.toFixed(8)
            newionvolume = body.result[0].BaseVolume
            newionvolume = newionvolume.toFixed(8)
            
            //Check if price is the same if not update the price
            if (newionprice != ionprice) {
            	ionprice = newionprice;
            	//Update price in DB
	            var ref = pricebtcRef.set({
	                moment: Date.now(),
	                price: ionprice
	            });
            }

            if (newionvolume != ionvolume) {
            	ionvolume = newionvolume;
            	//Update price in DB
	            var ref = ionvolumeRef.set({
	                moment: Date.now(),
	                volume: ionvolume
	            });
            }
        }
    })

   // Get BTC/USD price
    var url = "https://bittrex.com/api/v1.1/public/getticker?market=USDT-BTC"

    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            //console.log(body) // Print the json response
            USDPrice     = body.result.Last
        }
    })
    newionPriceUSD = USDPrice*ionprice;
    newionPriceUSD = newionPriceUSD.toFixed(2);
    // Check if price is the same if not update the price
    if (newionPriceUSD != ionPriceUSD) {
    	ionPriceUSD = newionPriceUSD
    	// Update price in DB
	    var ref = priceusdRef.set({
	                moment: Date.now(),
	                price: ionPriceUSD
	    });
    }
}
setInterval(function() {
    showResult();
}, 10000);
