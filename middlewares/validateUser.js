const { validateToken } = require("../services/authentication");

function validateUser(req, res, next) {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const user = validateToken(token);

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "UnAuthenticated User" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("error: ", err.message);
    return res.status(401).json({ error: true, message: "UnAuthorized user"});
  }
}

module.exports = { validateUser };
