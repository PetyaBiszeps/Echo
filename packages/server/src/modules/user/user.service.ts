import prisma from '@/db/prisma.ts'
import type {
  IUser
} from '@echo/shared'

export class UserService {
  async searchUsers(userId: string, query: unknown): Promise<IUser[]> {
    const normalizedQuery = typeof query === 'string'
      ? query.trim()
      : ''

    if (!normalizedQuery) {
      return []
    }

    return prisma.user.findMany({
      where: {
        id: {
          not: userId
        },
        username: {
          contains: normalizedQuery,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true
      },
      orderBy: {
        username: 'asc'
      },
      take: 10
    })
  }
}
