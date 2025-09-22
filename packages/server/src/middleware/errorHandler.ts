import type { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res) => {
    console.error(err)

    return res.status(500).json({
        error: 'Internal Server Error'
    })
}

export default errorHandler