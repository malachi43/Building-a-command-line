const { lPosts, cPost, dPosts, ePost, gPost } = require('../posts/posts')
const mongoose = require('mongoose')

async function getPosts(req, res) {
    const { skip = 1, limit = 9 } = req.query
    const opts = { page: skip, limit }
    const posts = await lPosts(opts)
    res.status(200).json({ posts, numOfDocs: posts.length })
}

async function editProduct(req, res) {
    const product = req.body
    const { id } = req.params
    const editedPost = await ePost(id, product)
    res.status(200).json(editedPost)
}


async function deleteProduct(req, res) {
    const { id } = req.params
    await dPosts(id)
    res.status(200).json({ success: true })
}

async function createProduct(req, res) {
    const product = req.body
    const newPost = await cPost(product)
    res.status(200).json(newPost)
}

async function getSinglePost(req, res) {
    const { id } = req.params
    const singlePost = await gPost({ id })
    res.status(200).json({ post: singlePost })
}





module.exports = { getPosts, editProduct, deleteProduct, createProduct, getSinglePost }