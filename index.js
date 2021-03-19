const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs');
const app = express();

app.use(fileUpload());

const port = 8088;
const conversion = require('./modules/csv2nm');

app.get('/', async (req, res) => {
	res.send("Working fine"+ __dirname)
});

app.post('/api/uploadFile', async (req, res) => {
	try {
		console.log(req.files);
		const file = req.files.CSVFILE
		file.mv(__dirname+"/modules/CSVFILE.xlsx", function(err,result){
			if(err){
				console.log(err);
				throw err;
			}
		})
		var data = await conversion()
		res.send(data)
	} catch (e) {
		console.log("In error");
		console.log(e);
		res.end()
	}
});


app.listen(port, () => console.log(`Listening to port : ${port}`));


// const express = require('express')
// const fileUpload = require('express-fileupload')
// const app = express();
//
// app.use(fileUpload());
//
// const port = 8088;
// const conversion = require('./modules/csv2nm');
//
// app.get('/', async (req, res) => {
// 	res.send("Working fine")
// });
//
// app.post('/api/uploadFile', async (req, res) => {
// 	try {
// 		console.log(req);
// 		if (__dirname+"/modules") {
// 			console.log(__dirname+"/modules");
// 		}
// 		fs.writeFile(
// 			__dirname+"/modules/CSVFILE.xlsx",
// 			Buffer.from(req.body, "binary"),
// 			function (err) {
// 				if (err) throw err;
// 				res.end(""+err)
// 			}
// 		);
// 		var data = await conversion()
// 		res.send(data)
// 	} catch (e) {
// 		console.log(e);
// 		res.end(""+e)
// 	}
// });
//
//
// app.listen(port, () => console.log(`Listening to port : ${port}`));
