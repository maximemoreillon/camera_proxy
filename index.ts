import dotenv from "dotenv"
dotenv.config()
import express from "express"
import "express-async-errors"
import cors from "cors"
import oidcMiddleware from "@moreillon/express-oidc"
import legacyAuthMiddleware from "@moreillon/express_identification_middleware"
import group_auth from "@moreillon/express_group_based_authorization_middleware"
import {
  redactedConnectionString,
  get_state as getMongoState,
  connect as mongoConnect,
} from "./db"
import promBundle from "express-prom-bundle"
import camera_router from "./routes/cameras"
import { version, author } from "./package.json"
import { Request, Response, NextFunction } from "express"

console.log(`Camera proxy v${version}`)

const {
  PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL,
  OIDC_JWKS_URI,
} = process.env

const promOptions = { includeMethod: true, includePath: true }

mongoConnect()

const app = express()
app.use(cors())
app.use(express.json())
app.use(promBundle(promOptions))
app.get("/", (req, res) => {
  res.send({
    author,
    application_name: "Camera proxy",
    version,
    mongodb: {
      connectionString: redactedConnectionString,
      state: getMongoState(),
    },
    auth: {
      url: IDENTIFICATION_URL,
      jwksUri: OIDC_JWKS_URI,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS,
      },
    },
  })
})

if (OIDC_JWKS_URI) {
  console.log(`[Auth] Enabling OIDC authentication using ${OIDC_JWKS_URI}`)
  app.use(oidcMiddleware({ jwksUri: OIDC_JWKS_URI }))
} else if (IDENTIFICATION_URL) {
  console.log(`[Auth] Enabling authentication using ${IDENTIFICATION_URL}`)
  const auth_options = { url: IDENTIFICATION_URL }
  app.use(legacyAuthMiddleware(auth_options))

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
