const utility = require('./jwt/jwt')

function cors(req, res, next) {
    const origin = req.headers.origin
    res.setHeader("Access-Control-Allow-Origin", origin || "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, XMODIFY")
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Max-Age", "86400")
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept")
    next()
}


function handleError(err, req, res, next) {
    if (err.message === 'Unauthenticated') {
        return res.status(401).json({ msg: "Unauthenticated. Please login." })
    }
    res.status(500).json({ error: err.stack || "INTERNAL SERVER ERROR" })
}

function notFound(req, res) {
    res.status(404).json({ error: "NOT FOUND" })
}


function isAuth(req, res, next) {
    try {
        const token = req.header('authorization') || req.cookies.jwt
        const payload = utility.verifyJWT(token)
        req.user = payload
        if (req.user.username === "admin") {
            req.isAuth = true
        }
        return next()
    } catch (error) {
        const err = new Error(`Unauthenticated`)
        throw err
    }

}
module.exports = { cors, handleError, notFound, isAuth }