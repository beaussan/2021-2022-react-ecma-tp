import { it, describe, expect, test } from 'vitest';
import axios from 'axios';
import { string, z } from 'zod';
import util from 'node:util';

const schema = z.object({
  foxPicture: z.string().url(),
  catFacts: z.string().array().length(3),
  holidays: z
    .object({
      date: z.string(),
      localName: string(),
      name: z.string(),
      countryCode: z.string(),
      fixed: z.boolean(),
      global: z.boolean(),
      contries: z.any(),
      launchYear: z.number().nullable(),
      types: z.string().array(),
    })
    .array(),
});

const fullShow = (obj) =>
  util.inspect(obj, { showHidden: false, depth: null, colors: true });

test('Api result should be the correct shape', async () => {
  const { data } = await axios.post('http://localhost:5000', {
    countryCode: 'FR',
  });
  console.log(fullShow(data));
  const parsed = schema.safeParse(data);
  if (parsed.success !== true) {
    console.error(fullShow(parsed.error.format()));
  }
  expect(parsed.success).toBeTruthy();
});

describe('Holidays', () => {
  it('should be of this year', async () => {
    const { data } = await axios.post('http://localhost:5000', {
      countryCode: 'FR',
    });
    const parsed = schema.parse(data);

    parsed.holidays.forEach((item) => expect(item.date).toContain('2022'));
  });

  it.each(['FR', 'BE', 'GB'])(
    'use the country code in the api response',
    async (contryCode) => {
      const { data } = await axios.post('http://localhost:5000', {
        countryCode: 'FR',
      });

      const parsed = schema.parse(data);

      parsed.holidays.forEach((item) =>
        expect(item.countryCode === contryCode),
      );
    },
  );
});
