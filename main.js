const express = require('express')
const dotenv = require('dotenv')
const httpProxy = require('http-proxy')
const cors = require('cors')
const bodyParser = require('body-parser')
const pjson = require('./package.json')
const auth = require('@moreillon/express_identification_middleware')
const db = require('./db.js')
const camera_router = require('./routes/cameras.js')
dotenv.config()

const PORT = process.env.PORT || 80
const auth_options = { url: `${process.env.AUTHENTICATION_API_URL}/whoami` }
const app = express()

app.use(cors())
app.use(bodyParser.json())


const proxy = httpProxy.createProxyServer()

const env_var_prefix = 'CAM'


const handle_proxy = (req, res, options) => {
  proxy.web(req, res, options, (error) => {
    res.status(500).send(error)
    console.log(error)
  })
}

app.get('/', (req, res) => {

  res.send({
    author: 'Maxime MOREILLON',
    application_name: 'Camera proxy',
    version: pjson.version,
    authentication_api_url: process.env.AUTHENTICATION_API_URL || 'UNDEFINED',
  })
})

app.use('/cameras',auth(auth_options),camera_router)


app.listen(PORT, () => {
  console.log(`Camera proxy listening on port ${PORT}`)
})
