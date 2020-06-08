const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// test request. gets response for utterance
// router.get('/', async (req, res) => {
// 	try {
// 		const q = encodeURIComponent('I ran for 2 minutes');
// 		const uri = 'https://api.wit.ai/message?v=20200513&q=' + q;
// 		const auth = 'Bearer ' + process.env.SERVER_TOKEN;
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
router.post('/', async (req, res) => {
	try {
		const data = req.body;
		const uri = 'https://api.wit.ai/speech?v=20200513';

		console.log('wav', data.wav);
		const response = await fetch(uri, {
			headers: {
				Authorization: 'Bearer ' + process.env.SERVER_TOKEN,
				'Content-Type': 'audio/wav',
				'--data-binary': data.wav,
			},
		});
		const json = await response.json();
		res.status(200).json(json);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

module.exports = router;
