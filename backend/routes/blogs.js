const express = require("express");
const router = express.Router();
const Blog = require("../db/models/blog/Blog");
const auth = require("../middleware/auth");

/*
 POST /api/blogs
 Creates a blog linked to the logged-in user
*/
router.post("/", auth, async (req, res) => {
  try {
    const blog = new Blog({
      author: req.user.id,        // comes from auth middleware
      film: req.body.film,
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
      createdAt: new Date()
    });

    await blog.save();
    res.status(201).json(blog);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create blog" });
  }
});

module.exports = router;
