import jwt from 'jsonwebtoken'
import prisma from '@/prisma'
import argon2 from 'argon2'
import type {
    IRegister,
    ILogin,
    IAuthResponse
} from '@echo/shared'

export class AuthService {
    private readonly jwtSecret: string
    private argonOptions: object = {
        type: argon2.argon2id
    }

    private signToken(payload: object) {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: '15m'
        })
    }

    constructor(opts?: { jwtSecret?: string }) {
        this.jwtSecret = opts?.jwtSecret ?? process.env.JWT_ACCESS_SECRET ?? 'FA2JF3SA4JI14358VD0TQ1EET0 '
    }

    async register(data: IRegister): Promise<IAuthResponse> {
        if (!data.username || !data.password) {
            throw new Error('Invalid data. Please enter a username and password')
        }
        const exists = await prisma.user.findUnique({
            where: {
                username: data.username
            }
        })

        if (exists) {
            throw new Error('User with this username already exists')
        }
        const hashPassword: string = await argon2.hash(data.password, this.argonOptions)

        const user = await prisma.user.create({
            data: {
                username: data.username,
                password: hashPassword,
            }
        })

        const token: string = this.signToken({
            sub: user.id
        })

        return {
            user: {
                id: user.id,
                username: user.username
            }, access_token: token
        }
    }

    async login(data: ILogin): Promise<IAuthResponse> {
        if (!data.username || !data.password) {
            throw new Error('Invalid data. Please enter a username and password')
        }
        const user = await prisma.user.findUnique({
            where: {
                username: data.username
            }
        })

        if (!user) {
            throw new Error('User with this username does not exist')
        }
        const verified: boolean = await argon2.verify(user.password, data.password)

        if (!verified) {
            throw new Error('Invalid credentials. Please enter valid username and password')
        }
        const token: string = this.signToken({
            sub: user.id
        })

        return {
            user: {
                id: user.id,
                username: user.username
            }, access_token: token
        }
    }
}