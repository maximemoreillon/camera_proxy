import { Schema, model } from "mongoose"

// TODO: add user_id
const cameraSchema = new Schema({
  name: String,
  stream_url: String,
  frame_url: String,
})

export default model("Camera", cameraSchema)
