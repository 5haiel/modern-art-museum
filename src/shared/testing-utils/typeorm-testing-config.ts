import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistEntity } from '../../artist/artist.entity/artist.entity';
import { ArtworkEntity } from '../../artwork/artwork.entity/artwork.entity';
import { ExhibitionEntity } from '../../exhibition/exhibition.entity/exhibition.entity';
import { ImageEntity } from '../../image/image.entity/image.entity';
import { MovementEntity } from '../../movement/movement.entity/movement.entity';
import { MuseumEntity } from '../../museum/museum.entity/museum.entity';
import { SponsorEntity } from '../../sponsor/sponsor.entity/sponsor.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [
      ArtistEntity,
      ArtworkEntity,
      ExhibitionEntity,
      ImageEntity,
      MovementEntity,
      MuseumEntity,
      SponsorEntity,
    ],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([
    ArtistEntity,
    ArtworkEntity,
    ExhibitionEntity,
    ImageEntity,
    MovementEntity,
    MuseumEntity,
    SponsorEntity,
  ]),
];
