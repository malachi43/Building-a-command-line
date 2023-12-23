const { Schema } = require('mongoose')
const { createId } = require("@paralleldrive/cuid2")

const postSchema = new Schema({
    _id: {
        type: String,
        default: createId
    },
    post: {
        type: String,
        required: [true, "post field is required"]
    },
    postDate: {
        type: Date,
        default: Date.now()
    }
})

postSchema.index({ postDate: 1 })

module.exports = postSchema
