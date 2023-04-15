import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import auth from "@moreillon/express_identification_middleware"
// @ts-ignore
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import * as db from "./db"
import apiMetrics from "prometheus-api-metrics"
import camera_router from "./routes/cameras"
import { version, author } from "./package.json"
import { Request, Response, NextFunction } from "express"

dotenv.config()

console.log(`Camera proxy v${version}`)

const {
  PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
} = process.env

db.connect()

const app = express()
app.use(cors())
app.use(express.json())
app.use(apiMetrics())

app.get("/", (req, res) => {
  res.send({
    author,
    application_name: "Camera proxy",
    version,
    mongodb: { url: db.url, db: db.db, state: db.get_state() },
    auth: {
      url: IDENTIFICATION_URL,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS,
      },
    },
  })
})

if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication using ${IDENTIFICATION_URL}`)
  const auth_options = { url: IDENTIFICATION_URL }
  app.use(auth(auth_options))
}

if (AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(
    `[Auth] Enabling group-based authorization using ${GROUP_AUTHORIZATION_URL}`
  )
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(","),
  }
  app.use(group_auth(group_auth_options))
}

app.use("/cameras", camera_router)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  let { statusCode = 500, message = error } = error
  if (isNaN(statusCode) || statusCode > 600) statusCode = 500
  res.status(statusCode).send(message)
})

app.listen(PORT, () => {
  console.log(`[Express] listening on port ${PORT}`)
})
