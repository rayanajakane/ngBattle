import { Test, TestingModule } from '@nestjs/testing';
import { MapStateHandlerService } from './map_state_handler.service';

describe('MapStateHandlerService', () => {
  let service: MapStateHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapStateHandlerService],
    }).compile();

    service = module.get<MapStateHandlerService>(MapStateHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
