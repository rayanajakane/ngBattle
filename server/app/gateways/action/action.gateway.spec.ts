import { Test, TestingModule } from '@nestjs/testing';
import { ActionGateway } from './action.gateway';

describe('ActionGateway', () => {
  let gateway: ActionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionGateway],
    }).compile();

    gateway = module.get<ActionGateway>(ActionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
