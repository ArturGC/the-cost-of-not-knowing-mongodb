# The cost of not knowing MongoDB

## Events and Reports

```ts
type Event = {
  key: string;
  date: Date;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

type Report = {
  id: 'oneYear' | 'threeYears' | 'fiveYears' | 'sevenYears' | 'tenYears';
  start: Date;
  end: Date;
  report: {
    approved: number;
    noFunds: number;
    pending: number;
    rejected: number;
  };
};
```

## Schemas

### Schema Version 1

```ts
type SchemaV1 = {
  _id: {
    key: string;
    date: Date;
  };
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};
```

### Schema Version 2

```ts
type SchemaV2 = {
  _id: ObjectId;
  key: string;
  date: Date;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};
```

### Schema Version 3

```ts
type SchemaV3 = {
  _id: ObjectId;
  key: Buffer;
  date: Date;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};
```

### Schema Version 4

```ts
type SchemaV4 = {
  _id: Buffer;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};
```

### Schema Version 5 Revision 0

```ts
type SchemaV5R0 = {
  _id: Buffer;
  items: Array<{
    date: Date;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  }>;
};
```

### Schema Version 5 Revision 1

```ts
type SchemaV5R1 = {
  _id: Buffer;
  report: {
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  items: Array<{
    date: Date;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  }>;
};
```

### Schema Version 6 Revision 0

```ts
type SchemaV6R0 = {
  _id: Buffer;
  items: Record<
    string,
    {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    }
  >;
};
```

### Schema Version 6 Revision 1

```ts
type SchemaV5R1 = {
  _id: Buffer;
  report: {
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  items: Record<
    string,
    {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    }
  >;
};
```

## Queries

### Event for query

### appV1

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: {
        date: new Date('2022-06-25T00:00:00.000Z'),
        key: '0000000000000000000000000000000000000000000000000000000000000001',
      },
    },
    update: {
      $inc: {
        approved: 1,
        noFunds: undefined,
        pending: undefined,
        rejected: undefined,
      },
    },
    upsert: true,
  },
};

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

### appV2

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      date: new Date('2022-06-25T00:00:00.000Z'),
      key: '0000000000000000000000000000000000000000000000000000000000000001',
    },
    update: {
      $inc: {
        approved: 1,
        noFunds: undefined,
        pending: undefined,
        rejected: undefined,
      },
    },
    upsert: true,
  },
};

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

### appV3

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      date: new Date('2022-06-25T00:00:00.000Z'),
      key: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex'),
    },
    update: {
      $inc: {
        a: 1,
        n: undefined,
        p: undefined,
        r: undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      key: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex'),
      date: {
        $gte: new Date('2021-06-15T00:00:00.000Z'),
        $lt: new Date('2022-06-15T00:00:00.000Z'),
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

### appV4

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('000000000000000000000000000000000000000000000000000000000000000120220625', 'hex'),
    },
    update: {
      $inc: {
        a: 1,
        n: undefined,
        p: undefined,
        r: undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('000000000000000000000000000000000000000000000000000000000000000120210615', 'hex'),
        $lt: Buffer.from('000000000000000000000000000000000000000000000000000000000000000120220615', 'hex'),
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

### appV5R0

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
    },
    update: {
      $push: {
        items: {
          date: new Date('2022-06-25T00:00:00.000Z'),
          a: 1,
          n: undefined,
          p: undefined,
          r: undefined,
        },
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202106', 'hex'),
        $lt: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
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
        $lte: new Date('2022-06-15T00:00:00.000Z'),
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

### appV5R1

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: {
      $push: {
        items: {
          date: new Date('2022-06-25T00:00:00.000Z'),
          a: 1,
          n: undefined,
          p: undefined,
          r: undefined,
        },
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
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

### appV5R2

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
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
                  if: { $not: { $eq: ['$$this.date', new Date('2022-06-25T00:00:00.000Z')] } },
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
                            r: '$$this.r',
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
                  [
                    {
                      date: new Date('2022-06-25T00:00:00.000Z'),
                      a: 1,
                      n: undefined,
                      p: undefined,
                      r: undefined,
                    },
                  ],
                ],
              },
            },
          },
        },
      },
      {
        $unset: ['result'],
      },
    ],
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
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

### appV5R3

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
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
                  if: { $not: { $eq: ['$$this.date', new Date('2022-06-25T00:00:00.000Z ')] } },
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
                            r: '$$this.r',
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
                  [
                    {
                      date: new Date('2022-06-25T00:00:00.000Z'),
                      a: 1,
                      n: undefined,
                      p: undefined,
                      r: undefined,
                    },
                  ],
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

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
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
                  { $gte: ['$$this.date', new Date('2021-06-15T00:00:00.000Z')] },
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
      approved: { $sum: '$report.a' },
      noFunds: { $sum: '$report.n' },
      pending: { $sum: '$report.p' },
      rejected: { $sum: '$report.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### appV5R4

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: [
      {
        $set: {
          'report.a': { $add: [1, { $cond: ['$report.a', '$report.a', 0] }] },
          result: {
            $reduce: {
              input: { $cond: ['$items', '$items', []] },
              initialValue: { found: false, items: [] },
              in: {
                $cond: {
                  if: { $not: { $eq: ['$$this.date', new Date('2022-06-25T00:00:00.000Z')] } },
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
                            r: '$$this.r',
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
                  [
                    {
                      date: new Date('2022-06-25T00:00:00.000Z'),
                      a: 1,
                      n: undefined,
                      p: undefined,
                      r: undefined,
                    },
                  ],
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

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
      },
    },
  },
  {
    $addFields: {
      report: {
        $cond: {
          if: {
            $and: [
              {
                $gt: [
                  '$_id',
                  Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
                ],
              },
              {
                $lt: [
                  '$_id',
                  Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
                ],
              },
            ],
          },
          then: '$report',
          else: {
            $reduce: {
              input: '$items',
              initialValue: { a: 0, n: 0, p: 0, r: 0 },
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $gte: ['$$this.date', new Date('2021-06-15T00:00:00.000Z')] },
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
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$report.a' },
      noFunds: { $sum: '$report.n' },
      pending: { $sum: '$report.p' },
      rejected: { $sum: '$report.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### appV6R0

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: {
      $inc: {
        'items.25.a': 1,
        'items.25.n': undefined,
        'items.25.p': undefined,
        'items.25.r': undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
      },
    },
  },
  {
    $addFields: {
      report: {
        $reduce: {
          input: { $objectToArray: '$items' },
          initialValue: { a: 0, n: 0, p: 0, r: 0 },
          in: {
            $cond: {
              if: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
                        ],
                      },
                      { $gte: ['$$this.k', '15'] },
                    ],
                  },
                  {
                    $and: [
                      {
                        $gt: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
                        ],
                      },
                      {
                        $lt: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
                        ],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202206', 'hex'),
                        ],
                      },
                      { $lt: ['$$this.k', '15'] },
                    ],
                  },
                ],
              },
              then: {
                a: { $add: ['$$value.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                n: { $add: ['$$value.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                p: { $add: ['$$value.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                r: { $add: ['$$value.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
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
      approved: { $sum: '$report.a' },
      noFunds: { $sum: '$report.n' },
      pending: { $sum: '$report.p' },
      rejected: { $sum: '$report.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### appV6R1

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: {
      $inc: {
        'items.0625.a': 1,
        'items.0625.n': undefined,
        'items.0625.p': undefined,
        'items.0625.r': undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
      },
    },
  },
  {
    $addFields: {
      report: {
        $reduce: {
          input: { $objectToArray: '$items' },
          initialValue: { a: 0, n: 0, p: 0, r: 0 },
          in: {
            $cond: {
              if: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
                        ],
                      },
                      { $gte: ['$$this.k', '0615'] },
                    ],
                  },
                  {
                    $and: [
                      {
                        $gt: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
                        ],
                      },
                      {
                        $lt: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
                        ],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: [
                          '$_id',
                          Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
                        ],
                      },
                      { $lt: ['$$this.k', '0615'] },
                    ],
                  },
                ],
              },
              then: {
                a: { $add: ['$$value.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                n: { $add: ['$$value.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                p: { $add: ['$$value.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                r: { $add: ['$$value.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
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
      approved: { $sum: '$report.a' },
      noFunds: { $sum: '$report.n' },
      pending: { $sum: '$report.p' },
      rejected: { $sum: '$report.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### appV6R2

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: {
      $inc: {
        'items.0625.a': 1,
        'items.0625.n': undefined,
        'items.0625.p': undefined,
        'items.0625.r': undefined,
        'report.a': 1,
        'report.n': undefined,
        'report.p': undefined,
        'report.r': undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
      },
    },
  },
  {
    $addFields: {
      report: {
        $cond: {
          if: {
            $and: [
              {
                $gt: [
                  '$_id',
                  Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
                ],
              },
              {
                $lt: [
                  '$_id',
                  Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
                ],
              },
            ],
          },
          then: '$report',
          else: {
            $reduce: {
              input: { $objectToArray: '$items' },
              initialValue: { a: 0, n: 0, p: 0, r: 0 },
              in: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $and: [
                          {
                            $eq: [
                              '$_id',
                              Buffer.from(
                                '0000000000000000000000000000000000000000000000000000000000000001202102',
                                'hex'
                              ),
                            ],
                          },
                          { $gte: ['$$this.k', '0615'] },
                        ],
                      },
                      {
                        $and: [
                          {
                            $gt: [
                              '$_id',
                              Buffer.from(
                                '0000000000000000000000000000000000000000000000000000000000000001202102',
                                'hex'
                              ),
                            ],
                          },
                          {
                            $lt: [
                              '$_id',
                              Buffer.from(
                                '0000000000000000000000000000000000000000000000000000000000000001202202',
                                'hex'
                              ),
                            ],
                          },
                        ],
                      },
                      {
                        $and: [
                          {
                            $eq: [
                              '$_id',
                              Buffer.from(
                                '0000000000000000000000000000000000000000000000000000000000000001202202',
                                'hex'
                              ),
                            ],
                          },
                          { $lt: ['$$this.k', '0615'] },
                        ],
                      },
                    ],
                  },
                  then: {
                    a: {
                      $add: ['$$value.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }],
                    },
                    n: {
                      $add: ['$$value.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }],
                    },
                    p: {
                      $add: ['$$value.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }],
                    },
                    r: {
                      $add: ['$$value.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }],
                    },
                  },
                  else: '$$value',
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $group: {
      _id: null,
      approved: { $sum: '$report.a' },
      noFunds: { $sum: '$report.n' },
      pending: { $sum: '$report.p' },
      rejected: { $sum: '$report.r' },
    },
  },
  { $project: { _id: 0 } },
];
```

### appV6R3 and appV6R4

```ts
const bulkOperation = {
  updateOne: {
    filter: {
      _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
    },
    update: {
      $inc: {
        'items.20220625.a': 1,
        'items.20220625.n': undefined,
        'items.20220625.p': undefined,
        'items.20220625.r': undefined,
      },
    },
    upsert: true,
  },
};

const pipeline = [
  {
    $match: {
      _id: {
        $gte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202102', 'hex'),
        $lte: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202202', 'hex'),
      },
    },
  },
  {
    $addFields: {
      report: {
        $reduce: {
          input: { $objectToArray: '$items' },
          initialValue: {
            oneYear: { a: 0, n: 0, p: 0, r: 0 },
            threeYears: { a: 0, n: 0, p: 0, r: 0 },
            fiveYears: { a: 0, n: 0, p: 0, r: 0 },
            sevenYears: { a: 0, n: 0, p: 0, r: 0 },
            tenYears: { a: 0, n: 0, p: 0, r: 0 },
          },
          in: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $gte: ['$$this.k', '20210615'] }, { $lt: ['$$this.k', '20220615'] }] },
                  then: {
                    oneYear: {
                      a: { $add: ['$$value.oneYear.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.oneYear.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.oneYear.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.oneYear.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    threeYears: {
                      a: { $add: ['$$value.threeYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.threeYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.threeYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.threeYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    fiveYears: {
                      a: { $add: ['$$value.fiveYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.fiveYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.fiveYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.fiveYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    sevenYears: {
                      a: { $add: ['$$value.sevenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.sevenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.sevenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.sevenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    tenYears: {
                      a: { $add: ['$$value.tenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.tenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.tenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.tenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                  },
                },
                {
                  case: { $and: [{ $gte: ['$$this.k', '20190615'] }, { $lt: ['$$this.k', '20220615'] }] },
                  then: {
                    oneYear: '$$value.oneYear',
                    threeYears: {
                      a: { $add: ['$$value.threeYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.threeYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.threeYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.threeYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    fiveYears: {
                      a: { $add: ['$$value.fiveYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.fiveYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.fiveYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.fiveYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    sevenYears: {
                      a: { $add: ['$$value.sevenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.sevenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.sevenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.sevenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    tenYears: {
                      a: { $add: ['$$value.tenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.tenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.tenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.tenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                  },
                },
                {
                  case: { $and: [{ $gte: ['$$this.k', '20170615'] }, { $lt: ['$$this.k', '20220615'] }] },
                  then: {
                    oneYear: '$$value.oneYear',
                    threeYears: '$$value.threeYears',
                    fiveYears: {
                      a: { $add: ['$$value.fiveYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.fiveYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.fiveYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.fiveYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    sevenYears: {
                      a: { $add: ['$$value.sevenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.sevenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.sevenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.sevenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    tenYears: {
                      a: { $add: ['$$value.tenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.tenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.tenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.tenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                  },
                },
                {
                  case: { $and: [{ $gte: ['$$this.k', '20150615'] }, { $lt: ['$$this.k', '20220615'] }] },
                  then: {
                    oneYear: '$$value.oneYear',
                    threeYears: '$$value.threeYears',
                    fiveYears: '$$value.fiveYears',
                    sevenYears: {
                      a: { $add: ['$$value.sevenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.sevenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.sevenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.sevenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                    tenYears: {
                      a: { $add: ['$$value.tenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.tenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.tenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.tenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                  },
                },
                {
                  case: { $and: [{ $gte: ['$$this.k', '20120615'] }, { $lt: ['$$this.k', '20220615'] }] },
                  then: {
                    oneYear: '$$value.oneYear',
                    threeYears: '$$value.threeYears',
                    fiveYears: '$$value.fiveYears',
                    sevenYears: '$$value.sevenYears',
                    tenYears: {
                      a: { $add: ['$$value.tenYears.a', { $cond: ['$$this.v.a', '$$this.v.a', 0] }] },
                      n: { $add: ['$$value.tenYears.n', { $cond: ['$$this.v.n', '$$this.v.n', 0] }] },
                      p: { $add: ['$$value.tenYears.p', { $cond: ['$$this.v.p', '$$this.v.p', 0] }] },
                      r: { $add: ['$$value.tenYears.r', { $cond: ['$$this.v.r', '$$this.v.r', 0] }] },
                    },
                  },
                },
              ],
              default: '$$value',
            },
          },
        },
      },
    },
  },
  {
    $group: {
      _id: null,
      oneYearApproved: { $sum: '$report.oneYear.a' },
      oneYearNoFunds: { $sum: '$report.oneYear.n' },
      oneYearPending: { $sum: '$report.oneYear.p' },
      oneYearRejected: { $sum: '$report.oneYear.r' },
      threeYearsApproved: { $sum: '$report.threeYears.a' },
      threeYearsNoFunds: { $sum: '$report.threeYears.n' },
      threeYearsPending: { $sum: '$report.threeYears.p' },
      threeYearsRejected: { $sum: '$report.threeYears.r' },
      fiveYearsApproved: { $sum: '$report.fiveYears.a' },
      fiveYearsNoFunds: { $sum: '$report.fiveYears.n' },
      fiveYearsPending: { $sum: '$report.fiveYears.p' },
      fiveYearsRejected: { $sum: '$report.fiveYears.r' },
      sevenYearsApproved: { $sum: '$report.sevenYears.a' },
      sevenYearsNoFunds: { $sum: '$report.sevenYears.n' },
      sevenYearsPending: { $sum: '$report.sevenYears.p' },
      sevenYearsRejected: { $sum: '$report.sevenYears.r' },
      tenYearsApproved: { $sum: '$report.tenYears.a' },
      tenYearsNoFunds: { $sum: '$report.tenYears.n' },
      tenYearsPending: { $sum: '$report.tenYears.p' },
      tenYearsRejected: { $sum: '$report.tenYears.r' },
    },
  },
  {
    $project: {
      _id: 0,
      oneYear: {
        approved: '$oneYearApproved',
        noFunds: '$oneYearNoFunds',
        pending: '$oneYearPending',
        rejected: '$oneYearRejected',
      },
      threeYears: {
        approved: '$threeYearsApproved',
        noFunds: '$threeYearsNoFunds',
        pending: '$threeYearsPending',
        rejected: '$threeYearsRejected',
      },
      fiveYears: {
        approved: '$fiveYearsApproved',
        noFunds: '$fiveYearsNoFunds',
        pending: '$fiveYearsPending',
        rejected: '$fiveYearsRejected',
      },
      sevenYears: {
        approved: '$sevenYearsApproved',
        noFunds: '$sevenYearsNoFunds',
        pending: '$sevenYearsPending',
        rejected: '$sevenYearsRejected',
      },
      tenYears: {
        approved: '$tenYearsApproved',
        noFunds: '$tenYearsNoFunds',
        pending: '$tenYearsPending',
        rejected: '$tenYearsRejected',
      },
    },
  },
];
```
