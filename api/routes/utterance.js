const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const router = express.Router();

// GETS UTTERANCE DATA FROM WIT.AI
router.get('/:utterance', async (req, res) => {
	try {
		const uri =
			'https://api.wit.ai/message?v=20200513&q=' + encodeURIComponent(req.params.utterance);
		const response = await fetch(uri, {
			headers: { Authorization: 'Bearer ' + process.env.CLIENT_TOKEN },
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
