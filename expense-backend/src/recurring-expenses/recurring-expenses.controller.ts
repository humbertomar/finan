import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recurring-expenses')
export class RecurringExpensesController {
    constructor(private readonly service: RecurringExpensesService) { }

    @Post()
    create(@Request() req, @Body() createDto: CreateRecurringExpenseDto) {
        return this.service.create(req.user.userId, createDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.service.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateRecurringExpenseDto) {
        return this.service.update(+id, req.user.userId, updateDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.service.remove(+id, req.user.userId);
    }
}
