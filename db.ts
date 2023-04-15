import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const { MONGODB_URL = "mongodb://mongo", MONGODB_DB = "camera_proxy" } =
  process.env

// Connection parameters
const connection_string = `${MONGODB_URL}/${MONGODB_DB}`

mongoose.set("strictQuery", true)

export const connect = () => {
  console.log(`[MongoDB] Attempting connection to ${MONGODB_URL}`)
  mongoose
    .connect(connection_string)
    .then(() => {
      console.log("[Mongoose] Initial connection successful")
    })
    .catch((error) => {
      console.log("[Mongoose] Initial connection failed")
      setTimeout(connect, 5000)
    })
}

export const db = MONGODB_DB
export const url = MONGODB_URL
export const get_state = () => mongoose.connection.readyState
