/**
 * A thin Node bridge for the production build, used only for local review
 * (the vision loop and the SSR gate). It serves dist/client/* as static files
 * and forwards everything else into the SSR {fetch} handler from
 * dist/server/server.js, exactly the pattern documented in site/README.md.
 *
 * Not a deployment artifact; a review harness so screenshots and curl checks
 * run against the real production bundle. Port 3100 by default.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = fileURLToPath(new URL('../', import.meta.url))
const CLIENT = join(SITE, 'dist/client')
const PORT = Number(process.argv[2] || 3100)

const handler = (await import(join(SITE, 'dist/server/server.js'))).default

const MIME = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
}

async function tryStatic(pathname) {
  // Only serve real files under dist/client (assets, fonts, covers, site).
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '')
  if (!rel) return null
  const fp = join(CLIENT, rel)
  if (!fp.startsWith(CLIENT + sep)) return null
  try {
    const s = await stat(fp)
    if (!s.isFile()) return null
    const body = await readFile(fp)
    return { body, type: MIME[extname(fp)] || 'application/octet-stream' }
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const asset = await tryStatic(url.pathname)
    if (asset) {
      res.writeHead(200, { 'content-type': asset.type })
      res.end(asset.body)
      return
    }
    // Forward to the SSR fetch handler.
    const request = new Request(url, { method: req.method, headers: req.headers, ...(!['GET', 'HEAD'].includes(req.method) ? { body: req, duplex: 'half' } : {}) })
    const response = await handler.fetch(request)
    const headers = {}
    response.headers.forEach((v, k) => (headers[k] = v))
    res.writeHead(response.status, headers)
    // Stream the body through progressively (TanStack Start uses streaming SSR;
    // buffering the whole response can stall the client's hydration handshake).
    if (response.body) {
      for await (const chunk of response.body) {
        res.write(Buffer.from(chunk))
      }
      res.end()
    } else {
      res.end(Buffer.from(await response.arrayBuffer()))
    }
  } catch (e) {
    res.writeHead(500)
    res.end('bridge error: ' + (e && e.message))
  }
})

server.listen(PORT, () => console.log(`prod bridge on http://localhost:${PORT}`))
