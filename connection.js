const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
let db =
  "mongodb+srv://gaurav123:<password>@cluster0.9w3u1.mongodb.net/BlogsDB?retryWrites=true&w=majority";

const connectDB = () => {
  mongoose
    .connect(db.replace("<password>", "gaurav123"))
    .then((res) => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = { connectDB };
