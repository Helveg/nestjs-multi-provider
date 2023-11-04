import { Test, TestingModule } from '@nestjs/testing';
import { ComplexService } from './complex.service';

describe('ComplexService', () => {
  let service: ComplexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplexService],
    }).compile();

    service = module.get<ComplexService>(ComplexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
