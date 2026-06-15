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
    userId: string
    lastReadAt: Date | null
    user: {
      id: string
      username: string
      lastSeenAt: Date | null
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

export interface IChatReadUpdate {
  chat: IChat
  readAt: string
}

export interface IUserLastSeen {
  userId: string
  lastSeenAt: string | null
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

  async getPeerUserIds(userId: string): Promise<string[]> {
    const chatIds = await this.getChatIds(userId)

    if (chatIds.length === 0) {
      return []
    }

    const members = await prisma.chatMember.findMany({
      where: {
        chatId: {
          in: chatIds
        },
        userId: {
          not: userId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    return members.map(member => member.userId)
  }

  async getChatPeerUserIds(chatId: string, userId: string): Promise<string[]> {
    const members = await prisma.chatMember.findMany({
      where: {
        chatId,
        userId: {
          not: userId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    return members.map(member => member.userId)
  }

  async getUsersLastSeen(userIds: string[]): Promise<IUserLastSeen[]> {
    const uniqueUserIds = Array.from(new Set(userIds))

    if (uniqueUserIds.length === 0) {
      return []
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds
        }
      },
      select: {
        id: true,
        lastSeenAt: true
      }
    })

    return users.map(user => ({
      userId: user.id,
      lastSeenAt: user.lastSeenAt?.toISOString() ?? null
    }))
  }

  async updateUserLastSeen(userId: string, lastSeenAt: Date): Promise<string> {
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        lastSeenAt
      },
      select: {
        lastSeenAt: true
      }
    })

    return user.lastSeenAt?.toISOString() ?? lastSeenAt.toISOString()
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
                username: true,
                lastSeenAt: true
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

    return Promise.all(chats.map(chat => this.toChat(chat, userId)))
  }

  async getChatUpdates(chatId: string): Promise<IChatUpdate[]> {
    const chat = await this.getChatById(chatId)

    if (!chat) {
      return []
    }

    return Promise.all(chat.members.map(async member => ({
      userId: member.user.id,
      chat: await this.toChat(chat, member.user.id)
    })))
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
                username: true,
                lastSeenAt: true
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
                username: true,
                lastSeenAt: true
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

  async markChatRead(userId: string, chatId: string): Promise<IChatReadUpdate> {
    await this.assertMember(userId, chatId)
    const readAt = new Date()

    await prisma.chatMember.update({
      where: {
        chatId_userId: {
          chatId,
          userId
        }
      },
      data: {
        lastReadAt: readAt
      }
    })

    const chat = await this.getChatById(chatId)

    if (!chat) {
      throw new UnauthorizedException('Chat not found or access denied')
    }

    return {
      chat: await this.toChat(chat, userId),
      readAt: readAt.toISOString()
    }
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
    const members = await prisma.chatMember.findMany({
      where: {
        chatId
      },
      select: {
        userId: true,
        lastReadAt: true
      }
    })
    const peer = members.length === 2
      ? members.find(member => member.userId !== userId)
      : null

    return messages.map(message => this.toMessage(
      message,
      message.senderId === userId
        ? Boolean(peer?.lastReadAt && peer.lastReadAt >= message.createdAt)
        : undefined
    ))
  }

  async createMessage(userId: string, chatId: string, content: unknown): Promise<IMessage> {
    const normalizedContent = typeof content === 'string'
      ? content.trim()
      : ''

    if (!normalizedContent) {
      throw new BadRequestException('Message content is required')
    }

    await this.assertMember(userId, chatId)

    const now = new Date()
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
          updatedAt: now
        }
      }),
      prisma.chatMember.update({
        where: {
          chatId_userId: {
            chatId,
            userId
          }
        },
        data: {
          lastReadAt: now
        }
      })
    ])

    return this.toMessage(message, false)
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
                username: true,
                lastSeenAt: true
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

  private async toChat(chat: ChatWithMembersAndMessages, userId: string): Promise<IChat> {
    const participants: IUser[] = chat.members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      lastSeenAt: member.user.lastSeenAt?.toISOString() ?? null
    }))
    const latestMessage = chat.messages[0]
      ? this.toMessage(chat.messages[0])
      : null
    const fallbackTitle = participants.find(participant => participant.id !== userId)?.username ?? null
    const unreadCount = await this.getUnreadCount(chat, userId)

    return {
      id: chat.id,
      title: chat.title,
      name: chat.title ?? fallbackTitle,
      participants,
      lastMessage: latestMessage,
      latestMessage,
      unreadCount,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    }
  }

  private async getUnreadCount(chat: ChatWithMembersAndMessages, userId: string) {
    const member = chat.members.find(item => item.userId === userId)

    if (!member) {
      return 0
    }

    return prisma.message.count({
      where: {
        chatId: chat.id,
        senderId: {
          not: userId
        },
        ...(member.lastReadAt
          ? {
            createdAt: {
              gt: member.lastReadAt
            }
          }
          : {})
      }
    })
  }

  private toMessage(message: {
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: Date
  }, isReadByPeer?: boolean): IMessage {
    const createdAt = message.createdAt.toISOString()

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      ...(typeof isReadByPeer === 'boolean'
        ? { isReadByPeer }
        : {}),
      createdAt,
      timestamp: createdAt
    }
  }
}
