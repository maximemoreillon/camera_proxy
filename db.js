const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const { MONGODB_URL = "mongodb://mongo", MONGODB_DB = "camera_proxy" } =
  process.env

// Connection parameters
const connection_string = `${MONGODB_URL}/${MONGODB_DB}`
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

// Connect to MongoDB
// TODO: reconnect
mongoose
  .connect(connection_string, options)
  .then(() => {
    console.log("[Mongoose] connected")
  })
  .catch((error) => {
    console.log(error)
  })

exports.db = MONGODB_DB
exports.url = MONGODB_URL
