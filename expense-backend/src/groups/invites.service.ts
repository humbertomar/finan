import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

interface CreateInviteDto {
    inviteeEmail: string;
}

@Injectable()
export class InvitesService {
    constructor(private prisma: PrismaService) { }

    async create(groupId: number, inviterId: number, createInviteDto: CreateInviteDto) {
        // Check if group exists and inviter is a member
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: true,
            },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const isMember = group.members.some((m) => m.userId === inviterId);
        if (!isMember) {
            throw new BadRequestException('You must be a member to invite others');
        }

        // Check if user already has a member record (by userId)
        const userByEmail = await this.prisma.user.findUnique({
            where: { email: createInviteDto.inviteeEmail },
        });

        if (userByEmail) {
            const existingMember = group.members.find((m) => m.userId === userByEmail.id);
            if (existingMember) {
                throw new BadRequestException('User is already a member of this group');
            }
        }

        // Check for pending invite
        const existingInvite = await this.prisma.groupInvite.findFirst({
            where: {
                groupId,
                inviteeEmail: createInviteDto.inviteeEmail,
                status: 'PENDING',
            },
        });

        if (existingInvite) {
            throw new BadRequestException('An invite is already pending for this user');
        }

        // Create token
        const token = crypto.randomBytes(32).toString('hex');

        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await this.prisma.groupInvite.create({
            data: {
                groupId,
                inviterId,
                inviteeEmail: createInviteDto.inviteeEmail,
                token,
                expiresAt,
            },
            include: {
                group: {
                    select: {
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return invite;
    }

    async findPendingByEmail(email: string) {
        const invites = await this.prisma.groupInvite.findMany({
            where: {
                inviteeEmail: email,
                status: 'PENDING',
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return invites;
    }

    async accept(token: string, userId: number) {
        const invite = await this.prisma.groupInvite.findUnique({
            where: { token },
            include: {
                group: true,
            },
        });

        if (!invite) {
            throw new NotFoundException('Invite not found');
        }

        if (invite.status !== 'PENDING') {
            throw new BadRequestException('Invite already processed');
        }

        if (new Date() > invite.expiresAt) {
            throw new BadRequestException('Invite has expired');
        }

        // Get user to check email
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.email !== invite.inviteeEmail) {
            throw new BadRequestException('This invite is for a different email');
        }

        // Check if already member
        const existingMember = await this.prisma.groupMember.findFirst({
            where: {
                groupId: invite.groupId,
                userId: userId,
            },
        });

        if (existingMember) {
            throw new BadRequestException('Already a member of this group');
        }

        // Add to group and update invite
        await this.prisma.$transaction([
            this.prisma.groupMember.create({
                data: {
                    groupId: invite.groupId,
                    userId: userId,
                    role: 'MEMBER',
                },
            }),
            this.prisma.groupInvite.update({
                where: { id: invite.id },
                data: {
                    status: 'ACCEPTED',
                },
            }),
        ]);

        return {
            message: 'Invite accepted successfully',
            group: invite.group,
        };
    }

    async reject(token: string, userId: number) {
        const invite = await this.prisma.groupInvite.findUnique({
            where: { token },
        });

        if (!invite) {
            throw new NotFoundException('Invite not found');
        }

        if (invite.status !== 'PENDING') {
            throw new BadRequestException('Invite already processed');
        }

        // Get user to check email
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.email !== invite.inviteeEmail) {
            throw new BadRequestException('This invite is for a different email');
        }

        await this.prisma.groupInvite.update({
            where: { id: invite.id },
            data: {
                status: 'REJECTED',
            },
        });

        return { message: 'Invite rejected' };
    }
}
