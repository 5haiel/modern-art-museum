import { Module } from '@nestjs/common';
import { MuseumArtworkService } from './museum-artwork.service';

@Module({
  providers: [MuseumArtworkService]
})
export class MuseumArtworkModule {}
