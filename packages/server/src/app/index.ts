import notFoundHandler from '@/middleware/notFoundHandler.ts'
import errorHandler from '@/middleware/errorHandler.ts'
import routes from '@/app/routes.ts'
import env from '@/config/env.ts'
import express from 'express'
import cors from 'cors'

// Constants
const app = express()
const host = env.HOST
const port = env.PORT

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
app.listen(port, host, (): void => {
  console.log(`Server started on http://${host}:${port}`)
})
