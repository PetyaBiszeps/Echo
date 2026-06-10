import prisma from '@/db/prisma.ts'
import {
  BadRequestException,
  UnauthorizedException
} from '@/lib/exceptions'
import type {
  IChat,
  IMessage,
  IUser
} from '@echo/shared'

type ChatWithMembersAndMessages = {
  id: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  members: Array<{
    user: {
      id: string
      username: string
    }
  }>
  messages: Array<{
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: Date
  }>
}

export interface IChatUpdate {
  userId: string
  chat: IChat
}

export class ChatService {
  async getChatIds(userId: string): Promise<string[]> {
    const members = await prisma.chatMember.findMany({
      where: {
        userId
      },
      select: {
        chatId: true
      }
    })

    return members.map(member => member.chatId)
  }

  async getChats(userId: string): Promise<IChat[]> {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return chats.map(chat => this.toChat(chat, userId))
  }

  async getChatUpdates(chatId: string): Promise<IChatUpdate[]> {
    const chat = await this.getChatById(chatId)

    if (!chat) {
      return []
    }

    return chat.members.map(member => ({
      userId: member.user.id,
      chat: this.toChat(chat, member.user.id)
    }))
  }

  async createDirectChat(userId: string, username: unknown): Promise<IChat> {
    const normalizedUsername = typeof username === 'string'
      ? username.trim()
      : ''

    if (!normalizedUsername) {
      throw new BadRequestException('Username is required')
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        username: normalizedUsername
      },
      select: {
        id: true,
        username: true
      }
    })

    if (!targetUser) {
      throw new BadRequestException('User not found')
    }

    if (targetUser.id === userId) {
      throw new BadRequestException('Cannot create a chat with yourself')
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [{
          members: {
            some: {
              userId
            }
          }
        }, {
          members: {
            some: {
              userId: targetUser.id
            }
          }
        }]
      },
      include: {
        _count: {
          select: {
            members: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (existingChat && existingChat._count.members === 2) {
      return this.toChat(existingChat, userId)
    }

    const chat = await prisma.chat.create({
      data: {
        members: {
          create: [{
            userId
          }, {
            userId: targetUser.id
          }]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return this.toChat(chat, userId)
  }

  async getMessages(userId: string, chatId: string): Promise<IMessage[]> {
    await this.assertMember(userId, chatId)

    const messages = await prisma.message.findMany({
      where: {
        chatId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return messages.map(message => this.toMessage(message))
  }

  async createMessage(userId: string, chatId: string, content: unknown): Promise<IMessage> {
    const normalizedContent = typeof content === 'string'
      ? content.trim()
      : ''

    if (!normalizedContent) {
      throw new BadRequestException('Message content is required')
    }

    await this.assertMember(userId, chatId)

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId,
          senderId: userId,
          content: normalizedContent
        }
      }),
      prisma.chat.update({
        where: {
          id: chatId
        },
        data: {
          updatedAt: new Date()
        }
      })
    ])

    return this.toMessage(message)
  }

  async assertMember(userId: string, chatId: string) {
    const member = await prisma.chatMember.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId
        }
      }
    })

    if (!member) {
      throw new UnauthorizedException('Chat not found or access denied')
    }

    return member
  }

  private async getChatById(chatId: string): Promise<ChatWithMembersAndMessages | null> {
    return prisma.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })
  }

  private toChat(chat: ChatWithMembersAndMessages, userId: string): IChat {
    const participants: IUser[] = chat.members.map(member => ({
      id: member.user.id,
      username: member.user.username
    }))
    const latestMessage = chat.messages[0]
      ? this.toMessage(chat.messages[0])
      : null
    const fallbackTitle = participants.find(participant => participant.id !== userId)?.username ?? null

    return {
      id: chat.id,
      title: chat.title,
      name: chat.title ?? fallbackTitle,
      participants,
      lastMessage: latestMessage,
      latestMessage,
      unreadCount: 0,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    }
  }

  private toMessage(message: {
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: Date
  }): IMessage {
    const createdAt = message.createdAt.toISOString()

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt,
      timestamp: createdAt
    }
  }
}
