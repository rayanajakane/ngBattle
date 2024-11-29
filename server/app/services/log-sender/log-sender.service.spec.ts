import { Test, TestingModule } from '@nestjs/testing';
import { LogSenderService } from './log-sender.service';

describe('LogSenderService', () => {
  let service: LogSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogSenderService],
    }).compile();

    service = module.get<LogSenderService>(LogSenderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
