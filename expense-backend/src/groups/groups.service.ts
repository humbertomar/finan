import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateGroupDto {
    name: string;
}

interface UpdateGroupDto {
    name?: string;
}

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createGroupDto: CreateGroupDto) {
        const group = await this.prisma.group.create({
            data: {
                name: createGroupDto.name,
                ownerId: userId,
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return group;
    }

    async findAll(userId: number) {
        const groups = await this.prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        expenses: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return groups;
    }

    async findOne(groupId: number, userId: number) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                expenses: {
                    include: {
                        category: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 10, // Last 10 expenses
                },
                _count: {
                    select: {
                        members: true,
                        expenses: true,
                    },
                },
            },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        // Check if user is member
        const isMember = group.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new ForbiddenException('You are not a member of this group');
        }

        return group;
    }

    async update(groupId: number, userId: number, updateGroupDto: UpdateGroupDto) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.ownerId !== userId) {
            throw new ForbiddenException('Only the owner can update the group');
        }

        return this.prisma.group.update({
            where: { id: groupId },
            data: updateGroupDto,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async remove(groupId: number, userId: number) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.ownerId !== userId) {
            throw new ForbiddenException('Only the owner can delete the group');
        }

        await this.prisma.group.delete({
            where: { id: groupId },
        });

        return { message: 'Group deleted successfully' };
    }

    async removeMember(groupId: number, userId: number, memberIdToRemove: number) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: true,
            },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.ownerId !== userId) {
            throw new ForbiddenException('Only the owner can remove members');
        }

        if (memberIdToRemove === userId) {
            throw new ForbiddenException('Owner cannot remove themselves');
        }

        const memberToRemove = group.members.find((m) => m.userId === memberIdToRemove);
        if (!memberToRemove) {
            throw new NotFoundException('Member not found in this group');
        }

        await this.prisma.groupMember.delete({
            where: { id: memberToRemove.id },
        });

        return { message: 'Member removed successfully' };
    }
}
