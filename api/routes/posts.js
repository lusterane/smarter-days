const express = require('express');
const router = express.Router();

const Post = require('../models/Post');

// GET ALL POSTS
router.get('/', (req, res) => {
	Post.find()
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => {
			res.status(500).send({
				message: err,
			});
		});
});

// SUBMITS A POST
router.post('/', (req, res) => {
	const request = req.body;
	const post = new Post({
		title: request.title,
		description: request.description,
	});

	// saves in database
	post.save()
		.then((data) => {
			// send back the data
			res.status(200).send(data);
		})
		.catch((err) => {
			// send back error message
			res.status(500).send({
				message: err,
			});
		});
});

// GET SPECIFIC POST
router.get('/:postId', (req, res) => {
	const id = req.params.postId;
	Post.findById(id)
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => {
			res.status(500).send({
				message: err,
			});
		});
});

// DELETE SPECIFIC POST
router.delete('/:postId', (req, res) => {
	const id = req.params.postId;
	Post.remove({ _id: id })
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => {
			res.status(500).send({ message: err });
		});
});

// UPDATE SPECIFIC POST
router.patch('/:postId', (req, res) => {
	const id = req.params.postId;
	const body = req.body;
	Post.updateOne(
		{ _id: id },
		{
			$set: {
				title: body.title,
			},
		}
	)
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
});

module.exports = router;
