// TODO: async
import Camera from "../models/camera"
import httpProxy from "http-proxy"
import { Request, Response } from "express"
import createHttpError from "http-errors"

const proxy = httpProxy.createProxyServer()

const handle_proxy = (req: Request, res: Response, options: any) => {
  proxy.web(req, res, options, (error: any) => {
    if (error) throw createHttpError(400, error)
  })
}

export const add_camera = async (req: Request, res: Response) => {
  const result = await Camera.create(req.body)
  console.log(`Camera ${result._id} created`)
  res.send(result)
}

export const remove_camera = async (req: Request, res: Response) => {
  const { camera_id } = req.params
  const result = await Camera.deleteOne({ _id: camera_id })
  console.log(`Camera ${camera_id} deleted`)
  res.send(result)
}

export const update_camera = async (req: Request, res: Response) => {
  const { camera_id } = req.params
  const new_properties = req.body

  // TODO: use findAndUpdateOne with error on not found
  const result = await Camera.updateOne({ _id: camera_id }, new_properties)
  console.log(`Camera ${camera_id} updated`)
  res.send(result)
}

export const get_all_cameras = async (req: Request, res: Response) => {
  const cameras = await Camera.find({})
  res.send(cameras)
}

export const get_camera = async (req: Request, res: Response) => {
  const { camera_id } = req.params
  const found_camera = await Camera.findOne({ _id: camera_id })
  if (!found_camera) throw createHttpError(404, "Camera not found")
  res.send(found_camera)
  console.log(`Camera ${camera_id} queried`)
}

export const get_stream = async (req: Request, res: Response) => {
  const { camera_id } = req.params
  const found_camera = await Camera.findOne({ _id: camera_id })
  if (!found_camera) throw createHttpError(404, "Camera not found")
  const { stream_url } = found_camera
  if (!stream_url)
    throw createHttpError(404, "Camera doest not have a stream URL")
  const proxy_options = { target: stream_url, ignorePath: true }
  handle_proxy(req, res, proxy_options)
}
