const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// test request. gets response for utterance
// router.get('/', async (req, res) => {
// 	try {
// 		const q = encodeURIComponent('I ran for 2 minutes');
// 		const uri = 'https://api.wit.ai/message?v=20200513&q=' + q;
// 		const auth = 'Bearer ' + process.env.CLIENT_TOKEN;
// 		const response = await fetch(uri, { headers: { Authorization: auth } });
// 		const json = await response.json();

// 		console.log(json);
// 		res.status(200).json(json);
// 	} catch (error) {
// 		console.log(error);
// 		res.status(500).json(error);
// 	}
// });

// sends audio to wit.ai and gets resposne
// not working right now
router.get('/', async (req, res) => {
	try {
		//const dataBinary = encodeURIComponent('I ran for 2 minutes');
		const uri = 'https://api.wit.ai/speech?v=20200513';

		const response = await fetch(uri, {
			headers: {
				Authorization: 'Bearer ' + process.env.CLIENT_TOKEN,
				'Content-Type': 'audio/wav',
			},
		});
		const json = await response.json();

		console.log(json);
		res.status(200).json(json);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;
