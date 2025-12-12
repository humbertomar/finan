import { Test, TestingModule } from '@nestjs/testing';
import { RecurringExpensesService } from './recurring-expenses.service';

describe('RecurringExpensesService', () => {
  let service: RecurringExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringExpensesService],
    }).compile();

    service = module.get<RecurringExpensesService>(RecurringExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
