const express = require('express')
const PORT = process.env.PORT || 1337
const api = require('./api/api')
const middlewares = require('./middlewares')
const app = express()
const dbConnection = require('./database/db')
const asyncWrapper = require('./lib/asyncWrapper')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const jwt = require('./jwt/jwt')
const { isAuth } = require('./middlewares')
const User = require('./users')

//disable express "x-powered-by" header
app.disable("x-powered-by")

//middlewares
require('./passportInit/passportInit')

app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(middlewares.cors)

app.get('/posts', asyncWrapper(api.getPosts))

app.get('/posts/:id', asyncWrapper(isAuth), asyncWrapper(api.getSinglePost))

app.post('/auth/register', asyncWrapper(async (req, res) => {
    const { username, email } = await User.createUser(req.body)
    res.status(201).json({ success: true, user: { email, username } })
}))

app.get('/auth/register', asyncWrapper(async (req, res) => {
    res.sendFile(`${__dirname}/register.html`)
}))
app.get('/auth/login', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})
app.delete('/posts/:id', asyncWrapper(isAuth), asyncWrapper(api.deleteProduct))

app.post("/auth/login", passport.authenticate('local', { session: false }), asyncWrapper((req, res) => {
    const token = jwt.createToken({ username: "admin" })
    res.cookie("jwt", token, {
        maxAge: 86400 * 12 * 1000
    })
    res.status(200).json({ msg: "You successfully logged in.", token })
}))

app.patch('/posts/:id', asyncWrapper(isAuth), asyncWrapper(api.editProduct))

app.post('/posts', asyncWrapper(isAuth), asyncWrapper(api.createProduct))

app.use(middlewares.notFound)
app.use(middlewares.handleError)




app.listen(PORT, async () => {
    const jsonData = require('./seed/mock.json')
    jsonData.map(data => {
        for (let key in data) {
            if (key === "body") {
                data["post"] = data["body"]
                delete data['body']
            } else {
                delete data[key]
            }

        }
        return data
    })

    const conn = await dbConnection

    const Post = conn.model('Post')
    await Post.deleteMany()
    const info = await Post.insertMany(jsonData)
    console.log(`server is listening on port:${PORT}`)
})
