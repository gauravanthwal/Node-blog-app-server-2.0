const { Router } = require("express");
const { Blog } = require("../models/blogSchema");
const { Comment } = require("../models/commenSchema");
const { User } = require("../models/userSchema");
const { validateToken } = require("../services/authentication");
const { validateUser } = require("../middlewares/validateUser");
const multer = require("multer");
const path = require("path");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

//////////////////////////////////// GET ALL BLOGS //////////////////////////////////
//////////////////////////////////// METHOD - GET //////////////////////////////////
router.get("/getAll", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({createdAt: -1});
    res.status(200).json({ success: true, blogs });
  } catch (err) {
    console.log("error", err.message);
    res.status(400).json({ error: true, message: err.message });
  }
});

router.get("/add-new", (req, res) => {
  return res.render("addBlog", { user: req.user });
});

//////////////////////////////////// ADD NEW BLOG //////////////////////////////////
//////////////////////////////////// METHOD - POST //////////////////////////////////
router.post("/add-new", validateUser, async (req, res) => {
  try {
    const { title, body, coverImageURL } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ error: true, message: "All the fields are required" });
    }
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL,
    });

    return res.status(201).json({ error: false, success: true, blog });
  } catch (err) {
    console.log(err.message);
    return res
      .status(400)
      .json({ error: true, message: "Blod doesn't created" });
  }
});

//////////////////////////////////// GET MY BLOGS //////////////////////////////////
//////////////////////////////////// METHOD - GET //////////////////////////////////
router.get("/myBlogs", async (req, res) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const user = validateToken(token);
    if (!user) {
      return res
        .status(400)
        .json({ error: true, message: "UnAuthenticated User" });
    }
    const myBlogs = await Blog.find({ createdBy: user._id }).sort({createdAt: -1});
    return res.status(200).json({ error: false, success: true, myBlogs });
  } catch (err) {
    console.log("error: ", err.message);
    res.status(400).json({ error: true, message: err.message });
  }
});

//////////////////////////////////// GET A SINGLE BLOG BY ID //////////////////////////////////
//////////////////////////////////// METHOD - GET //////////////////////////////////
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    ).sort({createdAt: -1});

    return res
      .status(200)
      .json({ error: false, success: true, blog, comments });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: err.message });
  }
});

////////////////////////////////// TODO ///////////////////////////
//////////////////////////////////// REMOVE MY BLOG //////////////////////////////////
//////////////////////////////////// MEHTOD - Delete //////////////////////////////////
router.delete("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findOneAndDelete({ _id: blogId });
    const comments = await Comment.deleteMany({ blogId });

    return res.status(200).json({
      error: false,
      message: "Post Deleted Successfully",
      success: true,
      blog,
      comments,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: err.message });
  }
});

//////////////////////////////////// COMMENT ON A BLOG //////////////////////////////////
//////////////////////////////////// METHOD - POST //////////////////////////////////
router.post("/comment/:blogId", async (req, res) => {
  try {
    if (!req.body.comment) {
      return res
        .status(400)
        .json({ error: true, message: "Text can not be empty" });
    }
    const token = req.headers.authorization.split("Bearer ")[1];
    const user = validateToken(token);

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized User" });
    }
    let comment = await Comment.create({
      createdBy: user._id,
      content: req.body.comment,
      blogId: req.params.blogId,
    });
    const createdBy = await User.findOne({ _id: user._id });

    comment.createdBy = createdBy;
    return res
      .status(200)
      .json({ error: false, success: true, message: "Comment Added", comment });
    // return res.redirect(`/blog/${req.params.blogId}`);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: err.message });
  }
});

//////////////////////////////////// REMOVE ALL BLOGS (ADMIN ONLY) //////////////////////////////////
//////////////////////////////////// METHOD - GET //////////////////////////////////
router.get("/remove", async (req, res) => {
  const blog = await Blog.deleteMany({});
  return res.json({ blog });
});

module.exports = router;
