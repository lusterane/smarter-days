const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const Intent = require('../models/Intent');

// GETS UTTERANCE DATA FROM WIT.AI
router.get('/nlp/:utterance', async (req, res) => {
	try {
		const uri =
			'https://api.wit.ai/message?v=20200513&q=' + encodeURIComponent(req.params.utterance);
		const response = await fetch(uri, {
			headers: { Authorization: 'Bearer ' + process.env.SERVER_TOKEN },
		});
		const json = await response.json();
		res.status(200).json(json);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// GETS ALL ENTRIES
router.get('/entries', (req, res) => {
	Intent.find()
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

// WRITES AN ENTRY OF UTTERANCE TO DATABASE
router.post('/entries', (req, res) => {
	const request = req.body;
	console.log('req', request);
	const { action, category, dateTime, duration, text, fromDateTime, toDateTime } = request;
	Intent.findOne({ category: category }, (err, intent) => {
		if (err) {
			console.log(err);
		} else {
			const resElement = intent ? intent.elements : [];
			Intent.findOneAndUpdate(
				{ category: category },
				{
					$set: {
						category: category,
						elements: resElement.concat({
							action: action,
							duration: duration,
							date: dateTime,
							text: text,
							fromDateTime: fromDateTime,
							toDateTime: toDateTime,
						}),
					},
				},
				{ upsert: true }
			)
				.then((data) => {
					res.status(200).json(data);
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json({ message: err });
				});
		}
	});
});

module.exports = router;
