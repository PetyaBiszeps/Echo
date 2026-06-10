import { SearchUsersController } from '@/modules/user/user.controller.ts'
import { AuthGuard } from '@/middleware/authGuard.ts'
import {
  Router
} from 'express'

const router = Router()

router.get('/search',
  AuthGuard,
  SearchUsersController)

export default router
