const mongoose = require('mongoose')
const pLM = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(pLM)

module.exports = mongoose.model('user', userSchema)