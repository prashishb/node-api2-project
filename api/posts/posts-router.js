// implement your posts router here
const express = require('express');
const router = express.Router();
const Post = require('./posts-model');

// [GET] /api/posts	(Returns an array of all the post objects contained in the database)
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

// [GET] /api/posts/:id	(Returns the post object with the specified id)
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

// [POST] /api/posts (Creates a post using the information sent inside the request body and returns the newly created post object)
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

// [PUT] /api/posts/:id	(Updates the post with the specified id using data from the request body and returns the modified document, not the original)
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

// [DELETE] /api/posts/:id	(Removes the post with the specified id and returns the deleted post object)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Post.findById(id)
    .then((post) => {
      if (post) {
        Post.remove(id).then((count) => {
          if (count > 0) {
            res.status(200).json({
              id: post.id,
              title: post.title,
              contents: post.contents,
            });
          } else {
            res.status(404).json({
              message: 'The post with the specified ID does not exist',
            });
          }
        });
      } else {
        res
          .status(404)
          .json({ message: 'The post with the specified ID does not exist' });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'The post could not be removed',
        error: err.message,
      });
    });
});

// [GET] /api/posts/:id/comments (Returns an array of all the comment objects associated with the post with the specified id)
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Post.findPostComments(id);
    if (comments.length) {
      res.status(200).json(comments);
    } else {
      res.status(404).json({
        message: 'The post with the specified ID does not exist',
      });
    }
  } catch (err) {
    res.status(500).json({
      message: 'The comments information could not be retrieved',
      error: err.message,
    });
  }
});

module.exports = router;
