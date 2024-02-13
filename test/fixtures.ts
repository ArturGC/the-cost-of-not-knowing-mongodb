import { faker } from '@faker-js/faker';

import * as T from '../src/types';

export const generateDocDefault = (): T.DocDefault => {
  const doc: T.DocDefault = {
    date: faker.date.between({
      from: '2018-01-01T00:00:00.000Z',
      to: '2023-01-01T00:00:00.000Z',
    }),
    key: faker.string.hexadecimal({ length: 64, prefix: '' }),
  };

  const value = Math.random();

  if (value < 0.8) doc.approved = 1;
  else if (value < 0.9) doc.rejected = 1;
  else if (value < 0.975) doc.pending = 1;
  else doc.rejected = 1;

  return doc;
};
