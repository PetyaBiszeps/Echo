import 'dotenv/config'
import errorHandler from '@/middleware/errorHandler'
import express from 'express'
import routes from '@/routes'
import cors from 'cors'

    // Constants
const app = express()
const port = process.env.PORT

    // Init
app.use(express.json({
    limit: '1mb',
}))

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

    // Routes
app.use('/api', routes)

    // Middleware
app.use(errorHandler)

    // Starting server
app.listen(port, (): void => {
    console.log('Server started on port:', port)
})