import 'dotenv/config'
import express, {
    Request, Response, NextFunction
} from 'express'

const app = express()
const PORT = process.env.PORT

    // Body parser
app.use(express.json({
    limit: '1mb',
}))

    // Routes
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send({
        status: 'Ok'
    })
})

app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to the server!')
})

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' })
    }
    next(err)
})

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
})