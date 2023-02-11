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

mongoose.set("strictQuery", true)

// Connect to MongoDB
const connect = () => {
  console.log(`[MongoDB] Attempting connection to ${MONGODB_URL}`)
  mongoose
    .connect(connection_string, options)
    .then(() => {
      console.log("[Mongoose] Initial connection successful")
    })
    .catch((error) => {
      console.log("[Mongoose] Initial connection failed")
      setTimeout(connect, 5000)
    })
}

exports.db = MONGODB_DB
exports.url = MONGODB_URL
exports.connect = connect
exports.get_state = () => mongoose.connection.readyState
