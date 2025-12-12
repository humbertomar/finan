import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

@Injectable()
export class RecurringExpensesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createDto: CreateRecurringExpenseDto) {
        return this.prisma.recurringExpense.create({
            data: {
                ...createDto,
                userId,
                // defaults handled by schema or simple enough
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.recurringExpense.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        const item = await this.prisma.recurringExpense.findFirst({
            where: { id, userId },
            include: { category: true },
        });
        if (!item) throw new NotFoundException('Despesa recorrente não encontrada');
        return item;
    }

    async update(id: number, userId: number, updateDto: UpdateRecurringExpenseDto) {
        await this.findOne(id, userId); // verify ownership
        return this.prisma.recurringExpense.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // verify ownership
        return this.prisma.recurringExpense.delete({ where: { id } });
    }
}
