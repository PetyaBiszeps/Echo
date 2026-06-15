import { env, defineConfig } from 'prisma/config'
import path from 'node:path'
import dotenv from 'dotenv'
import {
  fileURLToPath
} from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: path.join(dirname, '.env')
})

export default defineConfig({
  schema: path.join(dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(dirname, 'prisma/migrations')
  },
  datasource: {
    url: env('DATABASE_URL')
  }
})
