import { Test, TestingModule } from '@nestjs/testing';
import { CombatHandlerService } from './combat-handler.service';

describe('CombatHandlerService', () => {
  let service: CombatHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatHandlerService],
    }).compile();

    service = module.get<CombatHandlerService>(CombatHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
