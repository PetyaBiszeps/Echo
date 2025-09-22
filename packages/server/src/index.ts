import 'dotenv/config'
import errorHandler from '@/middleware/errorHandler'
import express from 'express'
import routes from '@/routes'

const app = express()
const port = process.env.PORT

app.use(express.json({
    limit: '1mb',
}))

app.use('/api', routes)




    // Other
app.get('/', (_req, res) => {
    res.send('Welcome to the server')
})

app.use(errorHandler)

app.listen(port, (): void => {
    console.log('Server started on port:', port)
})