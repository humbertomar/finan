import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, createExpenseDto: CreateExpenseDto) {
    const {
      isInstallment,
      installmentCount,
      totalAmount,
      date,
      ...rest
    } = createExpenseDto;

    const expense = await this.prisma.expense.create({
      data: {
        ...rest,
        date,
        totalAmount,
        isInstallment,
        installmentCount: isInstallment ? installmentCount : 1,
        userId,
      },
    });

    if (isInstallment && installmentCount && installmentCount > 1) {
      const installmentAmount = totalAmount / installmentCount;
      const installmentsData: any[] = [];

      for (let i = 0; i < installmentCount; i++) {
        const competenceDate = new Date(date);
        competenceDate.setMonth(competenceDate.getMonth() + i);

        installmentsData.push({
          expenseId: expense.id,
          number: i + 1,
          amount: installmentAmount,
          date: competenceDate,
          status: 'OPEN',
        });
      }

      await this.prisma.installment.createMany({
        data: installmentsData,
      });
    } else {
      // Single installment
      await this.prisma.installment.create({
        data: {
          expenseId: expense.id,
          number: 1,
          amount: totalAmount,
          date: date,
          status: 'OPEN',
        }
      });
    }

    return expense;
  }

  async findAll(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Find custom Logic:
    // We want expenses that happen in this month OR installments that fall in this month
    // Actually, expenses are usually just records. What matters for the monthly view are installments.
    // However, the prompt asks to "list expenses by month". Usually this means listing the items purchased.
    // But for a budget app, usually you view "what do I pay this month?".
    // Let's return expenses created in this month FOR NOW, plus filter by shared.

    return this.prisma.expense.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: userId },
              { isShared: true }
            ]
          },
          {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });
  }

  // Find installments for the "Dashboard" view (what to pay this month)
  async findInstallments(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.installment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        expense: {
          OR: [
            { userId: userId },
            { isShared: true }
          ]
        }
      },
      include: {
        expense: {
          include: {
            category: true,
            user: { select: { name: true } }
          }
        },
        paidBy: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    })
  }

  // Future installments
  async findFuture(userId: number) {
    const now = new Date();
    return this.prisma.installment.findMany({
      where: {
        date: { gt: now },
        status: 'OPEN',
        expense: {
          OR: [
            { userId: userId },
            { isShared: true }
          ]
        }
      },
      include: {
        expense: { include: { category: true } }
      },
      orderBy: { date: 'asc' }
    });
  }

  async payInstallment(userId: number, installmentId: number) {
    return this.prisma.installment.update({
      where: { id: installmentId },
      data: {
        status: 'PAID',
        paidById: userId,
        paidAt: new Date()
      }
    });
  }

  findOne(id: number) {
    return this.prisma.expense.findUnique({ where: { id }, include: { installments: true } });
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    return this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
    });
  }

  remove(id: number) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
