import express from 'express'

    // Constants
const app = express()
const PORT = process.env.PORT || 3001

    // Init
app.get('/', (_req, res) => {
    res.send('Echo Messenger is running 🚀')
})

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`)
})