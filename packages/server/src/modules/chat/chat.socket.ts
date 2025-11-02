import type { Server } from 'socket.io'
// import env from '@/config/env'
// import jwt from 'jsonwebtoken'
// import type {
//    IJWTPayload
// } from '@/types/auth'

function initChatSocket(io: Server) {
    io.use(() => {

    })

    io.on('connection', () => {

    })
}

export default initChatSocket