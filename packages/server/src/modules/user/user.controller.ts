import { UserService } from '@/modules/user/user.service.ts'
import type {
  NextFunction,
  Request,
  Response
} from 'express'

const service = new UserService()

export async function SearchUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    const users = await service.searchUsers(userId, req.query.q)

    return res.status(200).json({
      success: true,
      data: users
    })
  } catch (err) {
    return next(err)
  }
}
