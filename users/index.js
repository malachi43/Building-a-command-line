const db = require('../database/db')
const bcrypt = require('bcrypt')

async function createUser(user) {
    user = { ...user }
    user.password = await hashUserPassword(user)
    const User = await getUserModel()
    return await User.create(user)
}

async function editUser(id, user) {
    const User = await getUserModel()
    const updatedUser = await User.findOneAndUpdate({ _id: id }, { ...user }, { new: true, runValidators: true })
    return updatedUser
}

async function deleteUser(id) {
    const User = await getUserModel()
    await User.deleteOne({ _id: id })
}

async function getUsers(opts = {}) {
    const { offset = 0, limit = 5 } = opts
    const User = await getUserModel()
    return await User.find({}).skip(offset).limit(limit)
}

async function getSingleUser(username) {
    const User = await getUserModel()
    const user = await User.findOne({ username })
    return user
}


async function getUserModel() {
    return (await db).model('User')
}

async function hashUserPassword(user) {
    if (user.password && user.password.length >= 4 && user.password.length <= 12) {
        const SALT_ROUNDS = 12
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS)
        return hashedPassword
    }
    const err = new Error(`password field must be provided and must have a minimum of 4 characteres and at most 12 characters.`)
    throw err

}


module.exports = { getUsers, editUser, deleteUser, createUser, getSingleUser, getUserModel }