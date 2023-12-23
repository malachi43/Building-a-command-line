//populates the process.env object with content in the dotenv file.
require('dotenv').config()
const jwt = require("jsonwebtoken")
const jwtOpts = { algorithm: "HS256", expiresIn: "12d" }
const jwtSecret = process.env.JWT_SECRET

function createToken(payload) {
    return jwt.sign(payload, jwtSecret, jwtOpts)
}

function verifyJWT(token) {
    token = String(token).replace(/^Bearer /, "")
    return jwt.verify(token, jwtSecret)
}

module.exports = { createToken, verifyJWT }