import { Test, TestingModule } from '@nestjs/testing';
import { TurnTimerService } from './turn-timer.service';

describe('TurnTimerService', () => {
  let service: TurnTimerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurnTimerService],
    }).compile();

    service = module.get<TurnTimerService>(TurnTimerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
