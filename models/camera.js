const mongoose = require("mongoose")

// TODO: add user_id
const cameraSchema = new mongoose.Schema({
  name: String,
  stream_url: String,
  frame_url: String,
})

module.exports = mongoose.model("Camera", cameraSchema)
