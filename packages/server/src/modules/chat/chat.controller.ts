import { ChatService } from '@/modules/chat/chat.service'
import type {
    Request,
    Response,
    NextFunction
} from 'express'

const service = new ChatService()

export async function GetChatController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            })
        }
        const chats = await service.getChat(userId)

        return res.status(200).json({
            success: true,
            data: chats
        })
    } catch (err) {
        return next(err)
    }
}