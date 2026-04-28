import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MuseumEntity } from '../museum/museum.entity/museum.entity';
import { MuseumService } from './museum.service';
import { faker } from '@faker-js/faker';
import { MuseumQueryDto } from './museum.dto/museum-query.dto';

describe('MuseumService', () => {
  let service: MuseumService;
  let repository: Repository<MuseumEntity>;
  let museumsList: MuseumEntity[];

  const sortMuseums = (museums: MuseumEntity[]) =>
    [...museums].sort((museumA, museumB) => {
      if (museumA.foundedBefore !== museumB.foundedBefore) {
        return museumA.foundedBefore - museumB.foundedBefore;
      }

      if (museumA.name < museumB.name) return -1;
      if (museumA.name > museumB.name) return 1;
      return 0;
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MuseumService],
    }).compile();

    service = module.get<MuseumService>(MuseumService);
    repository = module.get<Repository<MuseumEntity>>(
      getRepositoryToken(MuseumEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    const museumsSeed = [
      {
        name: 'Museo del Oro',
        city: 'Bogota',
        foundedBefore: 1823,
      },
      {
        name: 'Museo Botero',
        city: 'Bogota',
        foundedBefore: 2000,
      },
      {
        name: 'Museo Nacional de Colombia',
        city: 'Bogota',
        foundedBefore: 1823,
      },
      {
        name: 'Museo de Antioquia',
        city: 'Medellin',
        foundedBefore: 1881,
      },
      {
        name: 'Museo de Arte Moderno de Bogota',
        city: 'Bogota',
        foundedBefore: 1963,
      },
      {
        name: 'Museo Colonial',
        city: 'Bogota',
        foundedBefore: 1942,
      },
      {
        name: 'Museo del Caribe',
        city: 'Barranquilla',
        foundedBefore: 2009,
      },
      {
        name: 'Museo Cali Moderno',
        city: 'Cali',
        foundedBefore: 1980,
      },
      {
        name: 'Museo de Cartagena',
        city: 'Cartagena',
        foundedBefore: 1890,
      },
      {
        name: 'Museo del Oro Quimbaya',
        city: 'Armenia',
        foundedBefore: 1986,
      },
      {
        name: 'Museo Casa de la Memoria',
        city: 'Medellin',
        foundedBefore: 2012,
      },
      {
        name: 'Museo Arte del Sur',
        city: 'Bogota',
        foundedBefore: 1875,
      },
    ];

    museumsList = [];
    for (const museumSeed of museumsSeed) {
      const museum: MuseumEntity = await repository.save({
        name: museumSeed.name,
        description: faker.lorem.sentence(),
        address: faker.address.secondaryAddress(),
        city: museumSeed.city,
        image: faker.image.imageUrl(),
        foundedBefore: museumSeed.foundedBefore,
      });
      museumsList.push(museum);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all museums', async () => {
    const museums: MuseumEntity[] = await service.findAll();
    expect(museums).not.toBeNull();
    expect(museums).toHaveLength(10);
  });

  it('findAll should use default pagination values', async () => {
    const museums: MuseumEntity[] = await service.findAll({});
    const expectedMuseums = sortMuseums(museumsList).slice(0, 10);

    expect(museums).toHaveLength(10);
    expect(museums.map((museum) => museum.name)).toEqual(
      expectedMuseums.map((museum) => museum.name),
    );
  });

  it('findAll should filter museums by name', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      name: 'oro',
    } as MuseumQueryDto);

    expect(museums).toHaveLength(2);
    expect(museums.every((museum) => museum.name.toLowerCase().includes('oro'))).toBe(
      true,
    );
  });

  it('findAll should filter museums by city', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      city: 'bog',
    } as MuseumQueryDto);

    expect(museums).toHaveLength(6);
    expect(museums.every((museum) => museum.city.toLowerCase().includes('bog'))).toBe(
      true,
    );
  });

  it('findAll should filter museums by foundedBefore', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      foundedBefore: 1900,
    } as MuseumQueryDto);

    expect(museums).toHaveLength(5);
    expect(museums.every((museum) => museum.foundedBefore < 1900)).toBe(true);
  });

  it('findAll should combine name and city filters', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      name: 'arte',
      city: 'bog',
    } as MuseumQueryDto);

    expect(museums).toHaveLength(2);
    expect(museums.every((museum) => museum.city === 'Bogota')).toBe(true);
  });

  it('findAll should combine city and foundedBefore filters', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      city: 'bog',
      foundedBefore: 1900,
    } as MuseumQueryDto);

    expect(museums).toHaveLength(3);
    expect(museums.every((museum) => museum.city === 'Bogota')).toBe(true);
    expect(museums.every((museum) => museum.foundedBefore < 1900)).toBe(true);
  });

  it('findAll should apply explicit pagination values', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      page: 2,
      limit: 5,
    } as MuseumQueryDto);
    const expectedMuseums = sortMuseums(museumsList).slice(5, 10);

    expect(museums).toHaveLength(5);
    expect(museums.map((museum) => museum.name)).toEqual(
      expectedMuseums.map((museum) => museum.name),
    );
  });

  it('findAll should paginate filtered museums', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      city: 'bog',
      page: 2,
      limit: 2,
    } as MuseumQueryDto);
    const expectedMuseums = sortMuseums(
      museumsList.filter((museum) => museum.city.toLowerCase().includes('bog')),
    ).slice(2, 4);

    expect(museums).toHaveLength(2);
    expect(museums.map((museum) => museum.name)).toEqual(
      expectedMuseums.map((museum) => museum.name),
    );
  });

  it('findAll should return an empty array when no museums match the filters', async () => {
    const museums: MuseumEntity[] = await service.findAll({
      name: 'inexistente',
    } as MuseumQueryDto);

    expect(museums).toEqual([]);
  });

  it('findOne should return a museum by id', async () => {
    const storedMuseum: MuseumEntity = museumsList[0];
    const museum: MuseumEntity = await service.findOne(storedMuseum.id);
    expect(museum).not.toBeNull();
    expect(museum.name).toEqual(storedMuseum.name);
    expect(museum.description).toEqual(storedMuseum.description);
    expect(museum.address).toEqual(storedMuseum.address);
    expect(museum.city).toEqual(storedMuseum.city);
    expect(museum.image).toEqual(storedMuseum.image);
    expect(museum.foundedBefore).toEqual(storedMuseum.foundedBefore);
  });

  it('findOne should throw an exception for an invalid museum', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The museum with the given id was not found',
    );
  });

  it('create should return a new museum', async () => {
    const museum: MuseumEntity = {
      id: '',
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      address: faker.address.secondaryAddress(),
      city: faker.address.city(),
      image: faker.image.imageUrl(),
      foundedBefore: 1990,
      exhibitions: [],
      artworks: [],
    };

    const newMuseum: MuseumEntity = await service.create(museum);
    expect(newMuseum).not.toBeNull();

    const storedMuseum: MuseumEntity = await repository.findOne({
      where: { id: newMuseum.id },
    });
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum.name).toEqual(newMuseum.name);
    expect(storedMuseum.description).toEqual(newMuseum.description);
    expect(storedMuseum.address).toEqual(newMuseum.address);
    expect(storedMuseum.city).toEqual(newMuseum.city);
    expect(storedMuseum.image).toEqual(newMuseum.image);
    expect(storedMuseum.foundedBefore).toEqual(newMuseum.foundedBefore);
  });

  it('update should modify a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    museum.name = 'New name';
    museum.address = 'New address';

    const updatedMuseum: MuseumEntity = await service.update(museum.id, museum);
    expect(updatedMuseum).not.toBeNull();

    const storedMuseum: MuseumEntity = await repository.findOne({
      where: { id: museum.id },
    });
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum.name).toEqual(museum.name);
    expect(storedMuseum.address).toEqual(museum.address);
  });

  it('update should throw an exception for an invalid museum', async () => {
    let museum: MuseumEntity = museumsList[0];
    museum = {
      ...museum,
      name: 'New name',
      address: 'New address',
    };
    await expect(() => service.update('0', museum)).rejects.toHaveProperty(
      'message',
      'The museum with the given id was not found',
    );
  });

  it('delete should remove a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    await service.delete(museum.id);

    const deletedMuseum: MuseumEntity = await repository.findOne({
      where: { id: museum.id },
    });
    expect(deletedMuseum).toBeNull();
  });

  it('delete should throw an exception for an invalid museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    await service.delete(museum.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The museum with the given id was not found',
    );
  });
});
