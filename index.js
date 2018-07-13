const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// Setup server
const httpServer = http.createServer((req, res) => {
  const urlObject = url.parse(req.url, true)
  const path = urlObject.pathname
  const decoder = new StringDecoder('utf8')

  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    const route = router[path] ? router[path] : handlers.notFound
    const data = {
      req,
      url: urlObject,
      payload: buffer
    }

    buffer += decoder.end()

    route(data, (statusCode, payload) => {
      const body = JSON.stringify(payload);
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(body)
    })
  })
})

// Start server
httpServer.listen(3000, () => {
  console.log('Server listening on http://localhost:3000')
})

// Route handlers
const handlers = {}

handlers.helloWorld = (data, callback) => {
  const payload = {}
  payload.message = 'Hello world'

  if (data.payload) {
    payload.received = data.payload
  }

  callback(200, payload)
}

handlers.notFound = (data, callback) => {
  const payload = {}
  payload.message = 'Page not found'
  payload.received = data.payload
  payload.debug = {
    url: data.url,
    headers: data.req.headers
  }
  callback(400, payload)
}

// Router
const router = {
  '/hello': handlers.helloWorld
}
