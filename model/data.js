const mongoose = require('mongoose')

const dataScheme = new mongoose.Schema({
    method: { type: String, required: true },
    input: { type: [String],required: true },
    token: { type: String },
})

module.exports = mongoose.model('equation',dataScheme)