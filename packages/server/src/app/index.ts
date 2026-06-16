import notFoundHandler from '@/middleware/notFoundHandler.ts'
import initChatSocket from '@/modules/chat/chat.socket.ts'
import errorHandler from '@/middleware/errorHandler.ts'
import routes from '@/app/routes.ts'
import env from '@/config/env.ts'
import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'

// Constants
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true
  }
})
const host = env.HOST
const port = env.PORT

initChatSocket(io)

// Init
app.use(express.json({
  limit: '1mb'
}))

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}))

// Routes
app.use('/api', routes)

// Middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Starting server
httpServer.listen(port, host, (): void => {
  console.log(`Server started on http://${host}:${port}`)
})
