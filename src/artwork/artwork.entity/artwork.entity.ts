import { ExhibitionEntity } from 'src/exhibition/exhibition.entity/exhibition.entity';
import { ImageEntity } from 'src/image/image.entity/image.entity';
import { MuseumEntity } from 'src/museum/museum.entity/museum.entity';
import { ArtistEntity } from 'src/artist/artist.entity/artist.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ArtworkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  mainImage: string;

  @ManyToOne(() => MuseumEntity, museum => museum.artworks)
  museum: MuseumEntity;

  @ManyToOne(() => ExhibitionEntity, exhibition => exhibition.artworks)
  exhibition: ExhibitionEntity;

  @OneToMany(() => ImageEntity, image => image.artwork)
  images: ImageEntity[];

  @ManyToOne(() => ArtistEntity, artist => artist.artworks)
  artist: ArtistEntity;
}
