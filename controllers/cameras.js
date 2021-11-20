const Camera = require("../models/camera.js")
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer()

const handle_proxy = (req, res, options) => {
  proxy.web(req, res, options, (error) => {
    res.status(500).send(error)
    console.log(error)
  })
}

const error_handling = (res) => {
  return (error) => {
    const code = error.code || 500
    const message = error.message || error
    res.status(code).send(message)
    console.error(message)
  }

}


exports.add_camera = (req, res) => {

  Camera.create(req.body)
    .then((result) => {
      res.send(result)
      console.log(`Camera ${result._id} saved in MongoDB`)
    })
    .catch(error_handling(res))
}

exports.remove_camera = (req, res) => {
  const {camera_id} = req.params
  Camera.deleteOne({_id:camera_id})
    .then( (result) => {
      res.send(result)
      console.log(`Camera ${camera_id} removed`)
    })
    .catch(error_handling(res))
}

exports.update_camera = (req, res) => {
  const {camera_id} = req.params
  const new_properties = req.body

  Camera.updateOne({_id:camera_id}, new_properties)
    .then((result) => {
      res.send(result)
      console.log(`Camera ${camera_id} updated in MongoDB`)
    })
    .catch(error_handling(res))
}

exports.get_all_cameras = (req, res) => {
  Camera.find({})
    .then( (result) => {
      res.send(result)
      console.log(`Cameras queried`)
    })
    .catch(error_handling(res))
}

exports.get_camera = (req, res) => {
  const {camera_id} = req.params
  Camera.findOne({_id:camera_id})
    .then( (found_camera) => {
      if(!found_camera) throw {code: 404, message: 'Camera not found'}
      res.send(found_camera)
      console.log(`Camera ${camera_id} queried`)
    })
    .catch(error_handling(res))
}




exports.get_stream = (req,res) => {

  const {camera_id} = req.params
  Camera.findOne({_id:camera_id})
    .then( (found_camera) => {
      if(!found_camera) throw {code: 404, message: 'Camera not found'}
      const {stream_url} = found_camera
      if(!stream_url) throw {code: 404, message: 'Camera doest not have a stream URL'}
      const proxy_options = { target: stream_url, ignorePath: true}
      console.log(`Streaming ${stream_url}`)
      handle_proxy(req, res, proxy_options)
    })
    .catch(error_handling(res))

}
