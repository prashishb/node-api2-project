// implement your posts router here
const express = require('express');
const router = express.Router();
const Post = require('./posts-model');

router.get('/', (req, res) => {
  Post.find(req.query)
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(500).json({
        message: 'The posts information could not be retrieved',
        error: err.message,
      });
    });
});

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist',
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'The post information could not be retrieved',
        error: err.message,
      });
    });
});

router.post('/', (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({
      message: 'Please provide title and contents for the post',
    });
  } else {
    Post.insert(req.body)
      .then(({ id }) => {
        res.status(201).json({ id, ...req.body });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'There was an error while saving the post to the database',
          error: err.message,
        });
      });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contents } = req.body;
    const post = await Post.findById(req.params.id);
    if (post) {
      if (title && contents) {
        const updatedPost = await Post.update(id, { title, contents });
        if (updatedPost === 1) {
          res.status(200).json({ id: Number(id), title, contents });
        } else {
          res
            .status(500)
            .json({ message: 'The post information could not be modified' });
        }
      } else {
        res.status(400).json({
          message: 'Please provide title and contents for the post',
        });
      }
    } else {
      res.status(404).json({
        message: 'The post with the specified ID does not exist',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'The post information could not be modified',
      error: err.message,
    });
  }
});

module.exports = router;
