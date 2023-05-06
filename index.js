require('dotenv').config()
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
// var bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;
const { connectDB } = require("./connection");
const { Blog } = require("./models/blogSchema");

const userRoute = require("./routes/users");
const blogRoute = require("./routes/blogs");

const { checkForAuthCookie } = require("./middlewares/auth");

// DB connection
connectDB();
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors());
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: false, parameterLimit: 50000 })
);
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.resolve("./public")));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({});

    res.status(200).json({ blogs, user: req.user });
    // res.render("home", { user: req.user, blogs });
  } catch (err) {
    console.log("error", err);
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.use("*", (req, res) => {
  return res.json({ message: "Url doent exist" });
});

app.listen(PORT, () => console.log("server is running at port ", PORT));
