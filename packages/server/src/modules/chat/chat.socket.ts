import type {
    // Socket,
    Server
} from 'socket.io'

function initChatSocket(io: Server) {
    io.use(() => {

    })

    io.on('connection', () => {

    })
}

export default initChatSocket