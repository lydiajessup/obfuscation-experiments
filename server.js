var fs = require('fs');

// Don't forget to install with NPM
var AWS = require('aws-sdk');

// Create a Rekognition
// Replace accessKeyId and secretAccessKey with your values
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27',
        "accessKeyId": "[REDACTED]",
        "secretAccessKey": "[REDACTED]",
         "region": "us-east-1"});

var express = require('express');
var app = express();
//var server = require('http').Server(app);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!')
});


// Prime the pump, create a face detection database with the images in the prime directory
app.get('/prime', function (req, res) {

	// Create a collection for the target images
	var vparams = {
	  CollectionId: "veillance"
	};

	rekognition.deleteCollection(vparams, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else console.log("delete",data);           // successful response

			rekognition.createCollection(vparams, function(err, data) {
			   if (err) {
				console.log("this is an error", err, err.stack); // an error occurred
			   }
			   else {
				console.log("create",data);           // successful response

				// Create the index // read all of the images in the directory
				fs.readdir("prime", function(err, list) {
					list.forEach(function (filename) {
						if (filename.includes(".jpg") || filename.includes(".png")) {
							fs.readFile("prime/"+filename, function(err, data) {
								console.log(filename);

								var imageBuffer = new Buffer(data);

								var params = {
								  CollectionId: "veillance",
								  DetectionAttributes: ["DEFAULT"],
								  ExternalImageId: filename,
								  Image: {
									Bytes: imageBuffer
								  }
								};
								rekognition.indexFaces(params, function(err, data) {
								   if (err) console.log(err, err.stack); // an error occurred
								   else     console.log("index",data);           // successful response
								});
							});
						}
					});
				});

			   }
			});
	});



});


//telling server where to listen
app.listen(80, function(){
  console.log("Server is running on port 80");
});
