import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtworkEntity } from '../artwork/artwork.entity/artwork.entity';
import { MuseumEntity } from '../museum/museum.entity/museum.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class MuseumArtworkService {
  constructor(
    @InjectRepository(MuseumEntity)
    private readonly museumRepository: Repository<MuseumEntity>,
    @InjectRepository(ArtworkEntity)
    private readonly artworkRepository: Repository<ArtworkEntity>,
  ) {}

  async addArtworkMuseum(
    museumId: string,
    artworkId: string,
  ): Promise<MuseumEntity> {
    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId },
      relations: ['museum'],
    });
    if (!artwork)
      throw new BusinessLogicException(
        'The artwork with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    artwork.museum = museum;
    await this.artworkRepository.save(artwork);

    return await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
  }

  async findArtworkByMuseumIdArtworkId(
    museumId: string,
    artworkId: string,
  ): Promise<ArtworkEntity> {
    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId },
      relations: ['museum'],
    });
    if (!artwork)
      throw new BusinessLogicException(
        'The artwork with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    if (artwork.museum?.id !== museum.id)
      throw new BusinessLogicException(
        'The artwork with the given id is not associated to the museum',
        BusinessError.PRECONDITION_FAILED,
      );

    return artwork;
  }

  async findArtworksByMuseumId(museumId: string): Promise<ArtworkEntity[]> {
    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return museum.artworks;
  }

  async associateArtworksMuseum(
    museumId: string,
    artworks: ArtworkEntity[],
  ): Promise<MuseumEntity> {
    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const persistedArtworks: ArtworkEntity[] = [];
    for (const artwork of artworks) {
      const persistedArtwork = await this.artworkRepository.findOne({
        where: { id: artwork.id },
      });
      if (!persistedArtwork)
        throw new BusinessLogicException(
          'The artwork with the given id was not found',
          BusinessError.NOT_FOUND,
        );
      persistedArtworks.push(persistedArtwork);
    }

    const nextArtworkIds = new Set(persistedArtworks.map(artwork => artwork.id));
    const artworksToDetach = museum.artworks.filter(
      artwork => !nextArtworkIds.has(artwork.id),
    );

    for (const artwork of artworksToDetach) {
      artwork.museum = null;
      await this.artworkRepository.save(artwork);
    }

    for (const artwork of persistedArtworks) {
      artwork.museum = museum;
      await this.artworkRepository.save(artwork);
    }

    return await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
  }

  async deleteArtworkMuseum(museumId: string, artworkId: string): Promise<void> {
    const artwork = await this.artworkRepository.findOne({
      where: { id: artworkId },
      relations: ['museum'],
    });
    if (!artwork)
      throw new BusinessLogicException(
        'The artwork with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    if (artwork.museum?.id !== museum.id)
      throw new BusinessLogicException(
        'The artwork with the given id is not associated to the museum',
        BusinessError.PRECONDITION_FAILED,
      );

    artwork.museum = null;
    await this.artworkRepository.save(artwork);
  }
}
