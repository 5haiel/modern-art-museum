import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { MuseumQueryDto } from './museum.dto/museum-query.dto';
import { MuseumEntity } from './museum.entity/museum.entity';
@Injectable()
export class MuseumService {
  constructor(
    @InjectRepository(MuseumEntity)
    private readonly museumRepository: Repository<MuseumEntity>,
  ) {}

  async findAll(query: MuseumQueryDto = {}): Promise<MuseumEntity[]> {
    const {
      name,
      city,
      foundedBefore,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.museumRepository
      .createQueryBuilder('museum')
      .leftJoinAndSelect('museum.artworks', 'artworks')
      .leftJoinAndSelect('museum.exhibitions', 'exhibitions')
      .distinct(true)
      .orderBy('museum.foundedBefore', 'ASC')
      .addOrderBy('museum.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (name) {
      queryBuilder.andWhere('LOWER(museum.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (city) {
      queryBuilder.andWhere('LOWER(museum.city) LIKE LOWER(:city)', {
        city: `%${city}%`,
      });
    }

    if (foundedBefore !== undefined) {
      queryBuilder.andWhere('museum.foundedBefore < :foundedBefore', {
        foundedBefore,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<MuseumEntity> {
    const museum: MuseumEntity = await this.museumRepository.findOne({
      where: { id },
      relations: ['artworks', 'exhibitions'],
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return museum;
  }

  async create(museum: MuseumEntity): Promise<MuseumEntity> {
    return await this.museumRepository.save(museum);
  }

  async update(id: string, museum: MuseumEntity): Promise<MuseumEntity> {
    const persistedMuseum: MuseumEntity = await this.museumRepository.findOne({
      where: { id },
    });
    if (!persistedMuseum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    museum.id = id;

    return await this.museumRepository.save(museum);
  }

  async delete(id: string) {
    const museum: MuseumEntity = await this.museumRepository.findOne({
      where: { id },
    });
    if (!museum)
      throw new BusinessLogicException(
        'The museum with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.museumRepository.remove(museum);
  }
}
