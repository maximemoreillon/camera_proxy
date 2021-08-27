const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const db_name = process.env.MONGODB_DB || 'camera_proxy'
// Connection parameters
const mongodb_url = `${process.env.MONGODB_URL}/${db_name}`
const mongodb_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

// Connect to MongoDB
mongoose.connect(mongodb_url, mongodb_options)
  .then(() => { console.log('Mongoose connected') })
  .catch((error) => { console.log(error) })

// Todo: reconnect
