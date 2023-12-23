const mongoose = require('mongoose')
const postSchema = require('../models/post')
const userSchema = require("../models/user")
require('dotenv').config()
const dbName = "fullstackNodejs"
const connectionString = `mongodb://127.0.0.1:27017/${dbName}`

async function connectDatabase(url) {
    const connection = await mongoose.connect(url)
    connection.model('Post', postSchema)
    connection.model("User", userSchema)
    return connection
}

const connection = connectDatabase(connectionString)
module.exports = connection