// call all the required packages
const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer')
const mqtt = require("mqtt")
var client = mqtt.connect('mqtt://test.mosquitto.org')

const app = express();
const topic = "esp8266/dyLinh_dev/ota_stm32"

client.on('connect', function(){
	// client.publish(topic, 'Hello', { qos: 0, retain: true }, (error) => {
	// 	if (error) {
	// 	  console.error(error)
	// 	}
	// })
	console.log('Connect to mqtt broker')
})

// SET STORAGE
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads')
	},
	filename: function (req, file, cb) {
		if(file.originalname == "version.txt")
		{
			cb(null, file.originalname)
		}else{
			cb(null,'firmware.bin')
		}
		
	}
})
   
var upload = multer({ storage: storage })

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
	const file = req.file
	console.log(file)
	if (!file) {
		const error = new Error('Please upload a file')
		error.httpStatusCode = 400
		return next(error)
	}
	res.send(file)
})

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
	const files = req.files
	if (!files) {
		const error = new Error('Please choose files')
		error.httpStatusCode = 400
		return next(error)
	}
	res.send(files)
})

app.post('/OTA', (req, res) => {
	client.publish(topic, 'OTA', { qos: 0, retain: false }, (error) => {
		if (error) {
		console.error(error)
		}
	})
	res.send('Start updating firmware !!!')
})
   
app.get('/download/firmware', function(req, res){
	res.sendFile(__dirname + '/uploads/firmware.bin')
})

app.get('/download/version', function(req, res){
	res.sendFile(__dirname + '/uploads/version.txt')
})
//CREATE EXPRESS APP
app.use(bodyParser.urlencoded({extended: true}))
 
//ROUTES WILL GO HERE
app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
})
  
//server.js
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
