import express from 'express'

const app = express()
const PORT = 3001

app.get('/', (_req, res) => {
    res.send('Welcome to the server')
})

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
})