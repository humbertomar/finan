import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseSplitsController } from './expense-splits.controller';

describe('ExpenseSplitsController', () => {
  let controller: ExpenseSplitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseSplitsController],
    }).compile();

    controller = module.get<ExpenseSplitsController>(ExpenseSplitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
