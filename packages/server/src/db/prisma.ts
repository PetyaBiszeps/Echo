import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import env from '@/config/env.ts'

export default new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.DATABASE_URL
  })
})
