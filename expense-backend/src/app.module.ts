import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { CategoriesModule } from './categories/categories.module';
import { IncomesModule } from './incomes/incomes.module';
import { RecurringExpensesModule } from './recurring-expenses/recurring-expenses.module';
import { GroupsModule } from './groups/groups.module';
import { ExpenseSplitsModule } from './expense-splits/expense-splits.module';
import { BalancesModule } from './balances/balances.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ExpensesModule,
    ReportsModule,
    CategoriesModule,
    IncomesModule,
    RecurringExpensesModule,
    GroupsModule,
    ExpenseSplitsModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
