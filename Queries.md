# The cost of not knowing MongoDB

### Schema Version 0 - Application Version 0

- Document:

```ts
const doc = {
  _id: {
    key: '0000000000000000000000000000000000000000000000000000000000000001',
    date: new Date('2022-06-15T00:00:00.000Z'),
  },
  approved: 1,
  noFunds: 1,
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: {
        key: '0000000000000000000000000000000000000000000000000000000000000001',
        date: new Date('2012-06-05T00:00:00.000Z'),
      },
    },
    update: {
      $inc: {
        approved: 1,
        rejected: 1,
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      '_id.key': '0000000000000000000000000000000000000000000000000000000000000001',
      '_id.date': {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$approved' },
      noFunds: { $sum: '$noFunds' },
      pending: { $sum: '$pending' },
      rejected: { $sum: '$rejected' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 0 - Application Version 1

- Document:

```ts
const doc = {
  _id: {
    key: '0000000000000000000000000000000000000000000000000000000000000001',
    date: new Date('2022-06-15T00:00:00.000Z'),
  },
  approved: 1,
  noFunds: 1,
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      '_id.key': '0000000000000000000000000000000000000000000000000000000000000001',
      '_id.date': new Date('2012-06-05T00:00:00.000Z'),
    },
    update: {
      $inc: {
        approved: 1,
        rejected: 1,
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      '_id.key': '0000000000000000000000000000000000000000000000000000000000000001',
      '_id.date': {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$approved' },
      noFunds: { $sum: '$noFunds' },
      pending: { $sum: '$pending' },
      rejected: { $sum: '$rejected' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 1 - Application Version 2

- Document:

```ts
const doc = {
  _id: new ObjectId('661a9aab285b8bda08ec957a'),
  key: '0000000000000000000000000000000000000000000000000000000000000001',
  date: new Date('2022-06-15T00:00:00.000Z'),
  approved: 1,
  noFunds: 1,
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      key: '0000000000000000000000000000000000000000000000000000000000000001',
      date: new Date('2012-06-05T00:00:00.000Z'),
    },
    update: {
      $inc: {
        approved: 1,
        rejected: 1,
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      key: '0000000000000000000000000000000000000000000000000000000000000001',
      date: {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$approved' },
      noFunds: { $sum: '$noFunds' },
      pending: { $sum: '$pending' },
      rejected: { $sum: '$rejected' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 2 - Application Version 3

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  approved: 1,
  noFunds: 1,
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: {
      $inc: {
        approved: 1,
        rejected: 1,
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$approved' },
      noFunds: { $sum: '$noFunds' },
      pending: { $sum: '$pending' },
      rejected: { $sum: '$rejected' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 3 - Application Version 4

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  a: 1,
  n: 1,
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: {
      $inc: {
        a: 1,
        r: 1,
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$a' },
      noFunds: { $sum: '$n' },
      pending: { $sum: '$p' },
      rejected: { $sum: '$r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 4 Revision 0 - Application Version 5 Revision 0

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  items: [
    { date: new Date('2022-06-25'), a: 1 },
    { date: new Date('2022-06-25'), a: 1 },
    { date: new Date('2022-06-25'), n: 1 },
    { date: new Date('2022-06-25'), n: 1 },
    { date: new Date('2022-06-15'), a: 1, n: 1 },
    { date: new Date('2022-06-15'), a: 1, p: 1 },
    { date: new Date('2022-06-15'), n: 1, p: 1 },
    { date: new Date('2022-06-15'), p: 1, r: 1 },
  ],
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: {
      $push: {
        items: {
          date: new Date('2012-06-05T00:00:00.000Z'),
          a: 1,
          r: 1,
        },
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $unwind: {
      path: '$items',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $match: {
      'items.date': {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$items.a' },
      noFunds: { $sum: '$items.n' },
      pending: { $sum: '$items.p' },
      rejected: { $sum: '$items.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 4 Revision 0 - Application Version 5 Revision 1

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  items: [
    { date: new Date('2022-06-25'), a: 1 },
    { date: new Date('2022-06-25'), a: 1 },
    { date: new Date('2022-06-25'), n: 1 },
    { date: new Date('2022-06-25'), n: 1 },
    { date: new Date('2022-06-15'), a: 1, n: 1 },
    { date: new Date('2022-06-15'), a: 1, p: 1 },
    { date: new Date('2022-06-15'), n: 1, p: 1 },
    { date: new Date('2022-06-15'), p: 1, r: 1 },
    { date: new Date('2022-05-15'), a: 1, n: 1 },
    { date: new Date('2022-05-15'), a: 1, p: 1 },
    { date: new Date('2022-05-15'), n: 1, p: 1 },
    { date: new Date('2022-05-15'), p: 1, r: 1 },
  ],
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: {
      $push: {
        items: {
          date: new Date('2012-06-05T00:00:00.000Z'),
          a: 1,
          r: 1,
        },
      },
    },
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $unwind: {
      path: '$items',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $match: {
      'items.date': {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$items.a' },
      noFunds: { $sum: '$items.n' },
      pending: { $sum: '$items.p' },
      rejected: { $sum: '$items.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 4 Revision 1 - Application Version 5 Revision 2

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  items: [
    { date: new Date('2022-06-25T00:00:00.000Z'), a: 2, n: 2 },
    { date: new Date('2022-06-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
    { date: new Date('2022-05-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
  ],
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: [
      {
        $set: {
          result: {
            $reduce: {
              input: { $cond: ['$items', '$items', []] },
              initialValue: { found: false, items: [] },
              in: {
                $cond: {
                  if: { $not: { $eq: ['$$this.date', new Date('2012-06-05T00:00:00.000Z')] } },
                  then: {
                    found: '$$value.found',
                    items: { $concatArrays: ['$$value.items', ['$$this']] },
                  },
                  else: {
                    found: true,
                    items: {
                      $concatArrays: [
                        '$$value.items',
                        [
                          {
                            date: '$$this.date',
                            a: { $add: [1, { $cond: ['$$this.a', '$$this.a', 0] }] },
                            n: '$$this.n',
                            p: '$$this.p',
                            r: { $add: [1, { $cond: ['$$this.r', '$$this.r', 0] }] },
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $set: {
          items: {
            $cond: {
              if: '$result.found',
              then: '$result.items',
              else: {
                $concatArrays: [
                  '$result.items',
                  [{ date: new Date('2012-06-05T00:00:00.000Z'), a: 1, r: 1 }],
                ],
              },
            },
          },
        },
      },
      { $unset: ['result'] },
    ],
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $unwind: {
      path: '$items',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $match: {
      'items.date': {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$items.a' },
      noFunds: { $sum: '$items.n' },
      pending: { $sum: '$items.p' },
      rejected: { $sum: '$items.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### Schema Version 4 Revision 1 - Application Version 5 Revision 3

- Document:

```ts
const doc = {
  _id: Buffer.from('...00000000120230615', 'hex'),
  items: [
    { date: new Date('2022-06-25T00:00:00.000Z'), a: 2, n: 2 },
    { date: new Date('2022-06-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
    { date: new Date('2022-05-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
  ],
};
```

- Bulk Write:

```ts
const bulkWriteOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from(
        '000000000000000000000000000000000000000000000000000000000000000120120605',
        'hex'
      ),
    },
    update: [
      {
        $set: {
          result: {
            $reduce: {
              input: { $cond: ['$items', '$items', []] },
              initialValue: { found: false, items: [] },
              in: {
                $cond: {
                  if: { $not: { $eq: ['$$this.date', new Date('2012-06-05T00:00:00.000Z')] } },
                  then: {
                    found: '$$value.found',
                    items: { $concatArrays: ['$$value.items', ['$$this']] },
                  },
                  else: {
                    found: true,
                    items: {
                      $concatArrays: [
                        '$$value.items',
                        [
                          {
                            date: '$$this.date',
                            a: { $add: [1, { $cond: ['$$this.a', '$$this.a', 0] }] },
                            n: '$$this.n',
                            p: '$$this.p',
                            r: { $add: [1, { $cond: ['$$this.r', '$$this.r', 0] }] },
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $set: {
          items: {
            $cond: {
              if: '$result.found',
              then: '$result.items',
              else: {
                $concatArrays: [
                  '$result.items',
                  [{ date: new Date('2012-06-05T00:00:00.000Z'), a: 1, r: 1 }],
                ],
              },
            },
          },
        },
      },
      { $unset: ['result'] },
    ],
    upsert: true,
  },
};
```

- Report Pipeline:

```ts
const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120120615',
          'hex'
        ),
        $lt: Buffer.from(
          '000000000000000000000000000000000000000000000000000000000000000120220615',
          'hex'
        ),
      },
    },
  },
  {
    $addFields: {
      report: {
        $reduce: {
          input: '$items',
          initialValue: { a: 0, n: 0, p: 0, r: 0 },
          in: {
            $cond: {
              if: {
                $and: [
                  { $gte: ['$$this.date', new Date('2012-06-15T00:00:00.000Z')] },
                  { $lt: ['$$this.date', new Date('2022-06-15T00:00:00.000Z')] },
                ],
              },
              then: {
                a: { $add: ['$$value.a', { $cond: ['$$this.a', '$$this.a', 0] }] },
                n: { $add: ['$$value.n', { $cond: ['$$this.n', '$$this.n', 0] }] },
                p: { $add: ['$$value.p', { $cond: ['$$this.p', '$$this.p', 0] }] },
                r: { $add: ['$$value.r', { $cond: ['$$this.r', '$$this.r', 0] }] },
              },
              else: '$$value',
            },
          },
        },
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$items.a' },
      noFunds: { $sum: '$items.n' },
      pending: { $sum: '$items.p' },
      rejected: { $sum: '$items.r' },
    },
  },
  { $project: { _id: 0 } },
];
```
