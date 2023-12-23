const db = require('../database/db')

async function listPosts(opts = {}) {
    try {
        const { page = 1, limit = 9 } = opts
        const skip = (page - 1) * limit
        const Post = (await db).model('Post')
        const posts = await Post.find().skip(skip).limit(limit)
        return posts
    } catch (error) {
        throw error
    }
}

async function editProduct(id, product) {
    try {
        const { edit } = product
        const Post = (await db).model('Post')
        edit.postDate = Date.now()
        const updatedPost = await Post.findByIdAndUpdate(id, edit, { new: true, runValidators: true })
        return updatedPost
    }
    catch (error) {
        throw error
    }

}


async function deleteProduct(id) {
    try {
        const Post = (await db).model('Post')
        await Post.deleteOne({ _id: id })
    } catch (error) {
        throw error
    }

}

async function createProduct(product) {
    try {
        const Post = (await db).model('Post')
        const newPost = await Post.create(product)
        return newPost
    } catch (error) {
        throw error
    }
}

async function getSinglePost(opts) {
    const { id } = opts
    const Post = (await db).model('Post')
    const singlePost = await Post.findOne({ _id: id })
    return singlePost
}


module.exports = { lPosts: listPosts, ePost: editProduct, dPosts: deleteProduct, cPost: createProduct, gPost: getSinglePost } 