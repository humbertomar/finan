import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpenseSplitsService {
    constructor(private prisma: PrismaService) { }

    async createEqualSplits(expenseId: number, totalAmount: number, groupId: number) {
        // Get group members
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
            include: { members: true },
        });

        if (!group) {
            throw new Error('Group not found');
        }

        const memberCount = group.members.length;
        const splitAmount = Number((Number(totalAmount) / memberCount).toFixed(2));

        // Create splits for each member
        const splits = await Promise.all(
            group.members.map((member) =>
                this.prisma.expenseSplit.create({
                    data: {
                        expenseId,
                        userId: member.userId,
                        amount: splitAmount,
                        percentage: Number((100 / memberCount).toFixed(2)),
                        confirmed: false, // Will be auto-confirmed for creator in expense service
                    },
                })
            )
        );

        return splits;
    }

    async getExpenseSplits(expenseId: number) {
        return this.prisma.expenseSplit.findMany({
            where: { expenseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async confirmSplit(expenseId: number, userId: number) {
        const split = await this.prisma.expenseSplit.findUnique({
            where: {
                expenseId_userId: {
                    expenseId,
                    userId,
                },
            },
        });

        if (!split) {
            throw new Error('Split not found');
        }

        return this.prisma.expenseSplit.update({
            where: { id: split.id },
            data: { confirmed: true },
        });
    }
}
