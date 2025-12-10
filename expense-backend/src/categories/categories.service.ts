import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    create(userId: number, createCategoryDto: CreateCategoryDto) {
        return this.prisma.category.create({
            data: {
                name: createCategoryDto.name,
                userId: userId,
            },
        });
    }

    findAll(userId: number) {
        return this.prisma.category.findMany({
            where: { userId },
        });
    }

    findOne(id: number) {
        return this.prisma.category.findUnique({ where: { id } });
    }

    update(id: number, updateCategoryDto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: number) {
        try {
            return await this.prisma.category.delete({
                where: { id },
            });
        } catch (error: any) {
            // Check if it's a foreign key constraint error (Prisma error codes)
            if (error.code === 'P2003' || error.code === 'P2014' || error.code === 'P2025') {
                throw new Error('Não é possível excluir esta categoria pois existem despesas vinculadas a ela.');
            }
            throw error;
        }
    }
}
