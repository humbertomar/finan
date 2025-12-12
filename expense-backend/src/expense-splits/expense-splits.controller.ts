import { Controller, Get, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ExpenseSplitsService } from './expense-splits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expense-splits')
@UseGuards(JwtAuthGuard)
export class ExpenseSplitsController {
    constructor(private readonly expenseSplitsService: ExpenseSplitsService) { }

    @Get('expense/:expenseId')
    getExpenseSplits(@Param('expenseId') expenseId: string) {
        return this.expenseSplitsService.getExpenseSplits(+expenseId);
    }

    @Put('expense/:expenseId/confirm')
    confirmSplit(@Param('expenseId') expenseId: string, @Request() req) {
        return this.expenseSplitsService.confirmSplit(+expenseId, req.user.userId);
    }
}
