import { ValidationPipe } from '@nestjs/common';
import { MuseumQueryDto } from './museum.dto/museum-query.dto';

describe('MuseumQueryDto', () => {
  const pipe = new ValidationPipe({ transform: true });

  it('should transform numeric query params to numbers', async () => {
    const result = await pipe.transform(
      { foundedBefore: '1900', page: '2', limit: '5' },
      {
        type: 'query',
        metatype: MuseumQueryDto,
      },
    );

    expect(result.foundedBefore).toBe(1900);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });

  it('should reject page values lower than 1', async () => {
    await expect(
      pipe.transform(
        { page: '0' },
        {
          type: 'query',
          metatype: MuseumQueryDto,
        },
      ),
    ).rejects.toThrow();
  });

  it('should reject limit values lower than 1', async () => {
    await expect(
      pipe.transform(
        { limit: '0' },
        {
          type: 'query',
          metatype: MuseumQueryDto,
        },
      ),
    ).rejects.toThrow();
  });

  it('should reject non numeric foundedBefore values', async () => {
    await expect(
      pipe.transform(
        { foundedBefore: 'no-numero' },
        {
          type: 'query',
          metatype: MuseumQueryDto,
        },
      ),
    ).rejects.toThrow();
  });
});
