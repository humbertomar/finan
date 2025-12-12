import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, HttpException, HttpStatus, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(req.user.userId, createCategoryDto);
    }

    @Get()
    findAll(@Request() req, @Query('type') type?: string) {
        return this.categoriesService.findAll(req.user.userId, type);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            return await this.categoriesService.remove(+id);
        } catch (error: any) {
            if (error.message && error.message.includes('despesas vinculadas')) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }
}
