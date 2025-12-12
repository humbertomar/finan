import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createIncomeDto: CreateIncomeDto) {
        console.log('IncomesService.create - Start. UserId:', userId, 'DTO:', createIncomeDto);

        try {
            const date = new Date(createIncomeDto.date);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }

            const data = {
                ...createIncomeDto,
                date: date,
                userId,
                // Ensure amount is processed if needed, though Prisma handles it.
                // But let's log the data being sent to prisma.
            };
            console.log('IncomesService.create - Prisma Data:', data);

            const result = await this.prisma.income.create({
                data,
            });
            console.log('IncomesService.create - Success:', result);
            return result;
        } catch (error: any) {
            console.error('IncomesService.create - Error:', error);
            if (error.code === 'P2003') {
                throw new NotFoundException('Categoria não encontrada ou inválida.');
            }
            throw new Error(`Failed to create income: ${error.message}`);
        }
    }

    async findAll(userId: number, month?: number, year?: number) {
        const where: any = { userId };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            where.date = { gte: startDate, lte: endDate };
        }

        return this.prisma.income.findMany({
            where,
            include: { category: true },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        const income = await this.prisma.income.findFirst({
            where: { id, userId },
            include: { category: true },
        });
        if (!income) throw new NotFoundException('Receita não encontrada');
        return income;
    }

    async update(id: number, userId: number, updateIncomeDto: UpdateIncomeDto) {
        await this.findOne(id, userId); // check existence

        const data: any = { ...updateIncomeDto };
        if (updateIncomeDto.date) {
            data.date = new Date(updateIncomeDto.date);
        }

        return this.prisma.income.update({
            where: { id },
            data,
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // check existence
        return this.prisma.income.delete({ where: { id } });
    }
}
