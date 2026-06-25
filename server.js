const { createServer } = require('http')
const { URL } = require('url')
const next = require('next')

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10)
const DEFAULT_HOST = '0.0.0.0'

function getLocalIP() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return '127.0.0.1'
}

async function main() {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    handle(req, res, {
      pathname: parsedUrl.pathname,
      query: Object.fromEntries(parsedUrl.searchParams),
    })
  })

  server.listen(DEFAULT_PORT, DEFAULT_HOST, () => {
    const ip = getLocalIP()
    console.log('\n  Stream on WiFi server running!')
    console.log(`  \n  Local:   http://localhost:${DEFAULT_PORT}`)
    console.log(`  Network: http://${ip}:${DEFAULT_PORT}`)
    console.log(`  \n  Open the Network URL on any device on the same WiFi.\n`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
