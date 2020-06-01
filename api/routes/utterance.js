const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const Intent = require('../models/Intent');

// GETS UTTERANCE DATA FROM WIT.AI
router.get('/:utterance', async (req, res) => {
	try {
		const uri =
			'https://api.wit.ai/message?v=20200513&q=' + encodeURIComponent(req.params.utterance);
		const response = await fetch(uri, {
			headers: { Authorization: 'Bearer ' + process.env.CLIENT_TOKEN },
		});
		const json = await response.json();
		res.status(200).json(json);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/entry', (req, res) => {
	const request = req.body;
	const { action, category, dateTime, duration, text } = request;

	Intent.findOne({ category: category }, (err, intent) => {
		if (err) {
			console.log(err);
		} else {
			const resDuration = intent ? intent.sumDuration : { value: 0 };
			const resElement = intent ? intent.elements : [];

			Intent.findOneAndUpdate(
				{ category: category },
				{
					$set: {
						category: category,
						sumDuration: {
							unit: duration.unit,
							value: resDuration.value + duration.value,
						},
						elements: resElement.concat({
							action: action,
							duration: duration,
							date: dateTime,
							text: text,
						}),
					},
				},
				{ upsert: true }
			)
				.then((data) => {
					console.log(data);
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
