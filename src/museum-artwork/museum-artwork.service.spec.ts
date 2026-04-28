import { Test, TestingModule } from '@nestjs/testing';
import { MuseumArtworkService } from './museum-artwork.service';

describe('MuseumArtworkService', () => {
  let service: MuseumArtworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MuseumArtworkService],
    }).compile();

    service = module.get<MuseumArtworkService>(MuseumArtworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
