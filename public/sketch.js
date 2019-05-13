// Stream dimensions
var WIDTH = 900;
var HEIGHT = 450;

var LEFT = "LEFT";
var RIGHT = "RIGHT";

// Create a Rekognition object
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27',
      "accessKeyId": "[REDACTED]",
       "secretAccessKey": "[REDACTED]",
        "region": "us-east-1"});

var imageStream = null;
var c;


///// Set up other variables
let who = "unknown";
let conf = 0;
let objectarray = ["unknown"];


///////////////////////////////////////////
// Setup function
///////////////////////////////////////////

function setup() {

  //set up canvas
  c = createCanvas(WIDTH, HEIGHT);
  c.parent('sketch-holder');

  //set up video
  imageStream = createCapture(VIDEO);
  imageStream.hide();

}

///////////////////////////////////////////
// Draw loop
///////////////////////////////////////////

function draw() {



  background(220);
  if (imageStream) {
    image(imageStream, 0, 0);
  }

  //draw box around prediction
  fill(0);
  rect(0, 0, 300, 90);

  //update prediction
  fill(255);
  textSize(32);
  text(who,10, 30);
  text(conf, 10, 70);

  //display the objects in image
  for (let i = 0; i < objectarray.length; i++){
    fill(0);
    text(objectarray[i].Name, 650, i*50+30);
  }

}


///////////////////////////////////////////
// Other Functions
///////////////////////////////////////////


function keyPressed() {

	// slice and dice image from canvas to get in right format for Rekognition
	var data = c.elt.toDataURL('image/jpeg', 1.0);
	var base64Image = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
	var binaryImg = atob(base64Image);
	var length = binaryImg.length;
	var ab = new ArrayBuffer(length);
	var ua = new Uint8Array(ab);
	for (var i = 0; i < length; i++) {
		ua[i] = binaryImg.charCodeAt(i);
	}

	/////// Press D for detecting MaxLabels ////////

	if (key == 'd') {

		// Rekognition detectLabels
		var params = {
		  Image: { /* required */
			     Bytes: ab
		  },
		  MaxLabels: 123,
		  MinConfidence: 70
		};

		rekognition.detectLabels(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else { // successful response
        objectarray = data.Labels;
        console.log(objectarray);
		  }

		});

	/////// Press f for detecting MaxLabels ////////

	} else if (key == 'f') {

		// Rekognition searchFaces
		var params = {
		  CollectionId: 'veillance', /* required */
		  Image: { /* required */
			Bytes: ab
		  },
		  FaceMatchThreshold: '90',
		  MaxFaces: '1'
		};

		rekognition.searchFacesByImage(params, function(err, data) {
		  if (err) console.log(err, err.stack);
		  else {          // successful response
        //display the name and confidence
        who = data.FaceMatches[0].Face.ExternalImageId;
        conf = data.FaceMatches[0].Face.Confidence;
        console.log(who);
		  }
		});
	}
  return who, conf, objectarray;

}


/// Server functions

function controlRequest(url) {
 fetch(url,{mode: "no-cors"})
  .then(response => {
    if (response.status === 200) {
      return response
    } else {
      //throw new Error('Something went wrong on api server!');
    }
  })
  .then(response => {
    console.debug(response);
  }).catch(error => {
    console.error(error);
  });

}
