const express = require('express')
const dotenv = require('dotenv')
const httpProxy = require('http-proxy')
const cors = require('cors')
const pjson = require('./package.json')
const auth = require('@moreillon/authentication_middleware')

dotenv.config()

const PORT = process.env.PORT || 80

const app = express()

app.use(cors())

const proxy = httpProxy.createProxyServer()

let handle_proxy = (req, res, options) => {
  proxy.web(req, res, options, (error) => {
    res.status(500).send(`The proxy failed to retrieve resource at ${process.env.PROXY_ROOT}`)
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

app.get('/cameras',auth.authenticate, (req,res) => {
  let cameras = []
  for (var variable in process.env) {
    if(variable.includes('CAMERA_')) {
      const camera_name = variable.split('_')[1].toLowerCase()
      cameras.push({
        variable: variable,
        name: camera_name,
        local_url: process.env[variable],
        route: `cameras/${camera_name}`
      })
    }
  }

  res.send(cameras)
})

app.all('/cameras/:camera*',auth.authenticate, (req,res) => {

  const camera_name = req.params.camera
  const env_var_prefix = 'CAMERA'

  const camera_name_formatted = camera_name.toUpperCase().replace('-','_')
  const target_hostname = process.env[`${env_var_prefix}_${camera_name_formatted}`]

  if(!target_hostname) {
    return res.status(404).send(`The Proxy is not configured to handle the camera called '${camera_name}'`)
  }

  const original_path = req.originalUrl

  // manage_path
  let path_split = original_path.split('/')

  // Remove /proxy/:service_name
  path_split.splice(1,2)
  const new_path =  path_split.join('/')

  // Assemble the target_url
  const target_url = `${target_hostname}${new_path}`

  const proxy_options = { target: target_url, ignorePath: true}

  console.log(`Proxying ${target_url}`)

  handle_proxy(req, res, proxy_options)
})


app.listen(PORT, () => {
  console.log(`Camera proxy listening on port ${PORT}`)
})
