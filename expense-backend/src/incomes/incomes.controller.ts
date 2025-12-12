import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
    constructor(private readonly incomesService: IncomesService) { }

    @Post()
    create(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
        console.log('IncomesController.create - User:', req.user);
        console.log('IncomesController.create - Payload:', createIncomeDto);
        return this.incomesService.create(req.user.userId, createIncomeDto);
    }

    @Get()
    findAll(@Request() req, @Query('month') month?: string, @Query('year') year?: string) {
        return this.incomesService.findAll(
            req.user.userId,
            month ? Number(month) : undefined,
            year ? Number(year) : undefined,
        );
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.incomesService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
        return this.incomesService.update(+id, req.user.userId, updateIncomeDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.incomesService.remove(+id, req.user.userId);
    }
}
