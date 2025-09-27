declare namespace NodeJS {
    interface processEnv {
        PORT?: string
        CORS_ORIGINS: string
        DATABASE_URL: string
        JWT_ACCESS_SECRET: string
    }
}