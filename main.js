const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const auth = require('@moreillon/express_identification_middleware')
const group_auth = require('@moreillon/express_group_based_authorization_middleware')
const db = require('./db.js')
const apiMetrics = require('prometheus-api-metrics')
const camera_router = require('./routes/cameras.js')
const {version} = require('./package.json')
dotenv.config()


console.log(`Camera proxy v${version}`)

const {
  PORT = 80,
  IDENTIFICATION_URL,
  AUTHORIZED_GROUPS,
  GROUP_AUTHORIZATION_URL
} = process.env

const app = express()
app.use(cors())
app.use(express.json())
app.use(apiMetrics())


app.get('/', (req, res) => {

  res.send({
    author: 'Maxime MOREILLON',
    application_name: 'Camera proxy',
    version: version,
    mongodb: { url: db.url, db: db.db },
    auth: {
      url: IDENTIFICATION_URL,
      group_auth: {
        url: GROUP_AUTHORIZATION_URL,
        groups: AUTHORIZED_GROUPS
      }
    },
    
  })
})

const auth_options = { url: IDENTIFICATION_URL }
app.use('/cameras',auth(auth_options),camera_router)

if(AUTHORIZED_GROUPS && GROUP_AUTHORIZATION_URL) {
  console.log(`[Auth] Enabling group-based authorization`)
  const group_auth_options = {
    url: GROUP_AUTHORIZATION_URL,
    groups: AUTHORIZED_GROUPS.split(',')
  }
  app.use(group_auth(group_auth_options))
}

app.listen(PORT, () => {
  console.log(`[Express] listening on port ${PORT}`)
})
