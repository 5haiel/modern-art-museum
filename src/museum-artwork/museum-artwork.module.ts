import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from '../artwork/artwork.entity/artwork.entity';
import { MuseumEntity } from '../museum/museum.entity/museum.entity';
import { MuseumArtworkService } from './museum-artwork.service';

@Module({
  imports: [TypeOrmModule.forFeature([MuseumEntity, ArtworkEntity])],
  providers: [MuseumArtworkService],
  exports: [MuseumArtworkService],
})
export class MuseumArtworkModule {}
