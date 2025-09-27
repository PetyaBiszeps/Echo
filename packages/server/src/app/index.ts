import notFoundHandler from '@/middleware/notFoundHandler'
import errorHandler from '@/middleware/errorHandler'
import routes from '@/app/routes'
import env from '@/config/env'
import express from 'express'
import cors from 'cors'

    // Constants
const app = express()
const host = env.HOST
const port = env.PORT

    // Init
app.use(express.json({
    limit: '1mb',
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