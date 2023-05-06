const JWT = require("jsonwebtoken");

const secret = "$upermanVSbatman";

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const paylaod = JWT.verify(token, secret);
  return paylaod;
}

module.exports = { createTokenForUser, validateToken };
