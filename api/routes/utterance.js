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
	const reqDuration = {
		unit: 'second',
		value: 500,
	};
	const reqElements = [];

	const intent = new Intent({
		category: category,
		sumDuration: {
			unit: reqDuration.unit,
			value: reqDuration.value + duration.value,
		},
		elements: reqElements.concat({
			action: action,
			duration: duration,
			date: dateTime,
			text: text,
		}),
	});

	intent
		.save()
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: err });
		});
});

module.exports = router;
