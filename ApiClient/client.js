const axios = require('axios')
const baseUrl = "http://localhost:1337"
const netrc = require("netrc")
const readNetrc = netrc()
const cliGetPosts = async (opts = {}) => {
    let { skip = 1, limit = 9 } = opts
    if (skip <= 0) {
        skip = 1
    }
    const res = await axios.get(`${baseUrl}/posts?skip=${skip}&limit=${limit}`)
    const { data: { posts } } = res
    return posts
}

const cliViewPost = async (opts) => {
    const url = new URL(baseUrl)
    const { id } = opts

    let config = {
        headers: {
            "authorization": `Bearer ${readNetrc[url.host].password}`
        }
    }

    const res = await axios.get(`${baseUrl}/posts/${id}`, config)
    const { data: { post } } = res
    return post
}

const cliEditPost = async (opts) => {
    const url = new URL(baseUrl)
    const { id, edit } = opts

    let config = {
        headers: {
            "authorization": `Bearer ${readNetrc[url.host].password}`
        }
    }

    const res = await axios.patch(`${baseUrl}/posts/${id}`, { edit }, config)
    const { data } = res
    return data
}

const cliLogin = async (opts) => {
    const { username = "", password = "" } = opts
    const res = await axios.post(`${baseUrl}/auth/login`, { username, password })
    const { data: { token } } = res
    return token
}


module.exports = { cliGetPosts, cliViewPost, cliEditPost, cliLogin }