import { Test, TestingModule } from '@nestjs/testing';
import { UniqueItemRandomiserService } from './unique-item-randomiser.service';

describe('UniqueItemRandomiserService', () => {
  let service: UniqueItemRandomiserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniqueItemRandomiserService],
    }).compile();

    service = module.get<UniqueItemRandomiserService>(UniqueItemRandomiserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
