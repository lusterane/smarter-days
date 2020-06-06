const mongoose = require('mongoose');

const Objects = mongoose.Schema({
	action: String,
	duration: {
		unit: String,
		value: Number,
	},
	date: Date,
	text: String,
	fromDateTime: {
		grain: String,
		value: Date,
	},
	toDateTime: {
		grain: String,
		value: Date,
	},
});

const IntentSchema = mongoose.Schema({
	category: String,
	sumDuration: { unit: String, value: Number },
	elements: [Objects],
});

module.exports = mongoose.model('Intents', IntentSchema);
