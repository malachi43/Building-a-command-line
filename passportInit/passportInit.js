const passport = require('passport')
const Strategy = require('passport-local').Strategy
const User = require("../users")
const bcrypt = require('bcrypt')

const LocalStrategy = new Strategy(
    async function (username, password, cb) {
        const isAdmin = username === 'admin' && password === process.env.ADMIN_PASSWORD
        //check if admin user exists
        if (isAdmin) return cb(null, { username: "admin" })

        try {
            const user = await User.getSingleUser(username)
            //check if a user with the username exists in the database.
            if (!user) return cb(null, false)


            const isPasswordValid = await bcrypt.compare(password, user.password)

            //check if password is correct.
            if (isPasswordValid) {
                return cb(null, { username: user.username })
            }
            cb(null, false)
        } catch (error) {
            throw error
        }
    }
)

passport.use(LocalStrategy)

module.exports = LocalStrategy