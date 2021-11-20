const mongoose = require('mongoose')

const cameraSchema = new mongoose.Schema({
    name: String,
    stream_url: String,
    frame_url: String,
})

module.exports = mongoose.model('Camera', cameraSchema)
