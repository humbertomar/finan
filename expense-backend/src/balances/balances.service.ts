import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Balance {
    userId: number;
    userName: string;
    userEmail: string;
    amount: number;
}

export interface BalanceSummary {
    toReceive: Balance[]; // People who owe me
    toPay: Balance[]; // People I owe
    netBalance: number;
}

@Injectable()
export class BalancesService {
    constructor(private prisma: PrismaService) { }

    async getUserBalances(userId: number): Promise<BalanceSummary> {
        // Get all confirmed splits where I'm involved
        const mySplits = await this.prisma.expenseSplit.findMany({
            where: {
                confirmed: true,
                expense: {
                    groupId: {
                        not: null,
                    },
                },
            },
            include: {
                expense: {
                    include: {
                        user: true, // The person who created/paid the expense
                        splits: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                user: true,
            },
        });

        const balances: { [key: number]: Balance } = {};

        // For each expense with splits
        const processedExpenses = new Set<number>();

        for (const split of mySplits) {
            const expense = split.expense;

            if (processedExpenses.has(expense.id)) continue;
            processedExpenses.add(expense.id);

            const expenseCreatorId = expense.userId;

            // For each split in this expense
            for (const otherSplit of expense.splits) {
                if (!otherSplit.confirmed) continue;

                // If I created the expense and someone else owes
                if (expenseCreatorId === userId && otherSplit.userId !== userId) {
                    const otherId = otherSplit.userId;
                    if (!balances[otherId]) {
                        balances[otherId] = {
                            userId: otherId,
                            userName: otherSplit.user.name,
                            userEmail: otherSplit.user.email,
                            amount: 0,
                        };
                    }
                    balances[otherId].amount += Number(otherSplit.amount);
                }

                // If someone else created and I owe
                if (expenseCreatorId !== userId && otherSplit.userId === userId) {
                    const creatorId = expenseCreatorId;
                    if (!balances[creatorId]) {
                        balances[creatorId] = {
                            userId: creatorId,
                            userName: expense.user.name,
                            userEmail: expense.user.email,
                            amount: 0,
                        };
                    }
                    balances[creatorId].amount -= Number(otherSplit.amount);
                }
            }
        }

        // Separate into toReceive and toPay
        const toReceive: Balance[] = [];
        const toPay: Balance[] = [];
        let netBalance = 0;

        Object.values(balances).forEach((balance) => {
            if (balance.amount > 0) {
                toReceive.push(balance);
                netBalance += balance.amount;
            } else if (balance.amount < 0) {
                toPay.push({ ...balance, amount: Math.abs(balance.amount) });
                netBalance += balance.amount;
            }
        });

        return {
            toReceive,
            toPay,
            netBalance,
        };
    }
}
