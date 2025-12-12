import { Module } from '@nestjs/common';
import { ExpenseSplitsService } from './expense-splits.service';
import { ExpenseSplitsController } from './expense-splits.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExpenseSplitsController],
  providers: [ExpenseSplitsService],
  exports: [ExpenseSplitsService],
})
export class ExpenseSplitsModule { }
