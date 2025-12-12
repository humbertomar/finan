import { Test, TestingModule } from '@nestjs/testing';
import { RecurringExpensesController } from './recurring-expenses.controller';

describe('RecurringExpensesController', () => {
  let controller: RecurringExpensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringExpensesController],
    }).compile();

    controller = module.get<RecurringExpensesController>(RecurringExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
