import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpenseSplitsModule } from '../expense-splits/expense-splits.module';

@Module({
  imports: [PrismaModule, ExpenseSplitsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule { }
