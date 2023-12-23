const { createId } = require("@paralleldrive/cuid2")
const { Schema } = require("mongoose")
const { isEmail, isAlphanumeric } = require("validator")

const userSchema = new Schema({
    _id: {
        type: String,
        default: createId
    },
    username: {
        type: String,
        required: true,
        unique: true,
        required: true,
        maxLength: 20,
        minLength: 4,
        lowercase: true,
        validate: [
            {
                validator: isAlphanumeric,
                message: props => `${props.value} contains special characters.`
            },
            {
                validator: str => !str.match(/^admin$/i),
                message: msg => `${msg.value} is not a vaild username`
            }
        ]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email.`

        }
    },
    password: {
        type: String,
        required: true,
    }
})


module.exports = userSchema