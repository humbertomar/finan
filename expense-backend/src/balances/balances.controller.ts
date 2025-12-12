import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('balances')
@UseGuards(JwtAuthGuard)
export class BalancesController {
    constructor(private readonly balancesService: BalancesService) { }

    @Get()
    getUserBalances(@Request() req) {
        return this.balancesService.getUserBalances(req.user.userId);
    }
}
