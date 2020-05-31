const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// import routes
const postsRoute = require('./api/routes/posts');
const audioRoute = require('./api/routes/audio');
const utteranceRoute = require('./api/routes/utterance');

app.use('/posts', postsRoute);
app.use('/audio', audioRoute);
app.use('/utterance', utteranceRoute);

// ROUTES
app.get('/', (req, res) => {
	res.send('We are on home');
});

// Connect to DB
mongoose.connect(
	process.env.DB_CONNECTION,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
	},
	() => console.log('Connected to db!')
);

// listening
app.listen(5000);
