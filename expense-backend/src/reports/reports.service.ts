import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  async getDashboard(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Logic: What do I have to pay this month?
    // It includes My Installments + Shared Installments (whether I paid or not yet)
    // Actually, "Total gasto no mês" usually means "Total Liability".

    // 1. Total spent in month (Installments due this month)
    const installments = await this.prisma.installment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        expense: {
          OR: [
            { userId: userId },
            { isShared: true }
          ]
        }
      },
      include: {
        expense: { select: { category: true, isShared: true } }
      }
    });

    const totalSpent = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 2. Total Next Month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const startNext = new Date(nextYear, nextMonth - 1, 1);
    const endNext = new Date(nextYear, nextMonth, 0);

    const nextInstallments = await this.prisma.installment.findMany({
      where: {
        date: { gte: startNext, lte: endNext },
        expense: {
          OR: [
            { userId: userId },
            { isShared: true }
          ]
        }
      }
    });
    const totalNextMonth = nextInstallments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 3. Category Pie Chart
    const categoryMap = new Map<string, number>();
    installments.forEach(inst => {
      const catName = inst.expense.category.name;
      const current = categoryMap.get(catName) || 0;
      categoryMap.set(catName, current + Number(inst.amount));
    });
    const pieChart = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // 4. Shared Expenses Stats
    const sharedInstallments = installments.filter(i => i.expense.isShared);
    const totalShared = sharedInstallments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // How much I paid vs Others paid (of the shared ones)
    // Note: status=PAID checks paidById. status=OPEN means nobody paid yet.
    // The requirement says: "Quanto cada usuário pagou no compartilhado"
    // We can just group by paidById

    const paidByMap = new Map<number, number>();
    sharedInstallments.forEach(i => {
      if (i.status === 'PAID' && i.paidById) {
        const current = paidByMap.get(i.paidById) || 0;
        paidByMap.set(i.paidById, current + Number(i.amount));
      }
    });

    // We need user names for this report
    const users = await this.prisma.user.findMany({ select: { id: true, name: true } });
    const sharedPaidBy = users.map(u => ({
      name: u.name,
      amount: paidByMap.get(u.id) || 0
    }));

    return {
      totalSpent,
      totalNextMonth,
      pieChart,
      sharedStats: {
        totalShared,
        paidBy: sharedPaidBy
      }
    };
  }
}
