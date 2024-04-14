# The cost of not knowing MongoDB

## Transaction and Reports

```ts
type Transaction = {
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
  a: number;
  n: number;
  p: number;
  r: number;
};

const transactions: Transaction = [
  { date: new Date('2022-06-25'), key: 1, a: 1 },
  { date: new Date('2022-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2022-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2022-06-05'), key: 1, a: 1, r: 1 },

  { date: new Date('2021-06-25'), key: 1, a: 1 },
  { date: new Date('2021-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2021-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2021-06-05'), key: 1, a: 1, r: 1 },

  { date: new Date('2019-06-25'), key: 1, a: 1 },
  { date: new Date('2019-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2019-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2019-06-05'), key: 1, a: 1, r: 1 },

  { date: new Date('2017-06-25'), key: 1, a: 1 },
  { date: new Date('2017-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2017-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2017-06-05'), key: 1, a: 1, r: 1 },

  { date: new Date('2015-06-25'), key: 1, a: 1 },
  { date: new Date('2015-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2015-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2015-06-05'), key: 1, a: 1, r: 1 },

  { date: new Date('2012-06-25'), key: 1, a: 1 },
  { date: new Date('2012-06-15'), key: 1, a: 1, n: 1 },
  { date: new Date('2012-06-10'), key: 1, a: 1, p: 1 },
  { date: new Date('2012-06-05'), key: 1, a: 1, r: 1 },
];

const reports = [
  {
    id: 'oneYear',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2021-06-15T00:00:00.000Z'),
    report: { approved: 4, noFunds: 1, pending: 1, rejected: 1 },
  },
  {
    id: 'threeYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2019-06-15T00:00:00.000Z'),
    report: { approved: 8, noFunds: 2, pending: 2, rejected: 2 },
  },
  {
    id: 'fiveYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2017-06-15T00:00:00.000Z'),
    report: { approved: 12, noFunds: 3, pending: 3, rejected: 3 },
  },
  {
    id: 'sevenYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2015-06-15T00:00:00.000Z'),
    report: { approved: 16, noFunds: 4, pending: 4, rejected: 4 },
  },
  {
    id: 'tenYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2012-06-15T00:00:00.000Z'),
    report: { approved: 20, noFunds: 5, pending: 5, rejected: 5 },
  },
];
```

## Schemas and Apps

### Schema Version 0

```ts
type SchemaV0 = {
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

#### Application Version 0

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
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
- Issue: The index in the `_id` field doesn't work for queries that filters by fields inside the document of `_id`.
  ```ts
  const filter = {
    '_id.date': { $gte: new Date('2018-06-25'), $lt: new Date('2022-06-25') },
  };
  ```
- Solution: Create a compound index on `_id.key` and `_id.date`.
  ```ts
  const index = { '_id.key': 1, '_id.date': 1 };
  ```

#### Application Version 1

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }, { '_id.key': 1, '_id.date': 1 }];
  ```
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
- Issue: The index and field `_id` is bigger than it needs to be and with no use by the application.
- Solution: Change the `_id` field to be the native ObjectId and move the fields `key` and `date` to the document.

### Schema Version 1

```ts
type SchemaV1 = {
  _id: ObjectId;
  key: string;
  date: Date;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};
```

#### Application Version 2

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }, { key: 1, date: 1 }];
  ```
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
- Issue:
  1. The field `key` has hexadecimal data but it's being stored as string, using more storage than it really needs;
  1. There are two indexes but just one is being used by the application;
- Solution: Change the `_id` field to be the concatenation of the fields `key` and `date`, and as its content is hexadecimal characters, store it as binary type.

  ```ts
  const day = new Date('2023-06-15');
  const dayDataString = day.toISOString().split('T')[0]; // "2023-06-15";
  const dayDataSemTracoString = dayDataString.replace(/-/g, ''); // "20230615"
  const keyString = '0000000000000000000000000000000000000000000000000000000000000001';

  const _idString = keyString + dayDataSemTracoString;
  // _idString = "000000000000000000000000000000000000000000000000000000000000000120230615"
  const _id = Buffer.from(_idString, 'hex');
  // _id = <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 20 23 06 15>
  ```

### Schema Version 2

```ts
type SchemaV2 = {
  _id: Buffer;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};
```

#### Application Version 3

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:
  ```ts
  const doc = {
    _id: Buffer.from('000000000000000000000000000000000000000000000000000000000000000120230615', 'hex'),
    approved: 1,
    noFunds: 1,
  };
  ```
- Issue: The data stored in each type of transaction is of type integer, which uses 32 bits/4 bytes. The name of field indicating each type of transaction is a string, that in some cases has 8 characters, which uses 8 bytes. We're using more storage with the name of the data than the data itself;
- Solution: Reduce/shorthand the name of the fields.

### Schema Version 3

```ts
type SchemaV3 = {
  _id: Buffer;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};
```

#### Application Version 4

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:
  ```ts
  const doc = {
    _id: Buffer.from('000000000000000000000000000000000000000000000000000000000000000120230615', 'hex'),
    a: 1,
    n: 1,
  };
  ```
- Issue: Each document is around 59 bytes and has one index entry. The data that we are storing in it is on average 8 bytes. The ratio of storage is 8/59=0.136 and the ration of index is 8/1=8;
- Solution: Implement bucket pattern to bucket the transactions by month.

### Schema Version 4 Revision 0

```ts
type SchemaV4R0 = {
  _id: Buffer;
  items: {
    date: Date;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  }[];
};
```

#### Application Version 5 Revision 0

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202306', 'hex'),
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

- Issue: Maybe we can improve the storage density even more;
- Solution: Implement the bucket pattern to bucket transactions by quarter.

#### Application Version 5 Revision 1

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
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

- Issue: Every transaction generate is being pushed to the items array, even if they have the same date;
- Solution: When the items array already have an item for a specific date, instead of adding a new item, combine the transactions.

#### Application Version 5 Revision 2

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    items: [
      { date: new Date('2022-06-25T00:00:00.000Z'), a: 2, n: 2 },
      { date: new Date('2022-06-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
      { date: new Date('2022-05-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
    ],
  };
  ```

- Issue: To generate the reports, the aggregation pipeline is using a $unwind followed by a $group, which generates a pipeline with a lot of documents and not making use of the bucketing;
- Solution: Use a $addFields stage with $reduce operation to calculate the report of each document and then do a full report with a $group stage.

#### Application Version 5 Revision 3

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    items: [
      { date: new Date('2022-06-25T00:00:00.000Z'), a: 2, n: 2 },
      { date: new Date('2022-06-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
      { date: new Date('2022-05-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
    ],
  };
  ```

- Issue: Every time a report is requested, all the transaction need to be summed;
- Solution: Implement pre calculate parts of the reports on writing and store it in the document. Computed Pattern.

### Schema Version 4 Revision 1

```ts
type SchemaV4R1 = {
  _id: Buffer;
  report: {
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  items: {
    date: Date;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  }[];
};
```

#### Application Version 5 Revision 4

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    report: {
      a: 6,
      n: 6,
      p: 6,
      r: 2,
    },
    items: [
      { date: new Date('2022-06-25T00:00:00.000Z'), a: 2, n: 2 },
      { date: new Date('2022-06-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
      { date: new Date('2022-05-15T00:00:00.000Z'), a: 2, n: 2, p: 3, r: 1 },
    ],
  };
  ```

- Issue: The logic to check the items array to see if it already has an item of a specific date and then merge the items is CPU intensive;
- Solution: Instead of items be an array, it could be an object where the name of the fields in the object is the date of the transaction.

### Schema Version 5 Revision 0

```ts
type SchemaV5R0 = {
  _id: Buffer;
  items: {
    [date as string]: {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    };
  };
};
```

#### Application Version 6 Revision 0

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202306', 'hex'),
    items: {
      '15': { a: 2, n: 2, p: 3, r: 1 },
      '25': { a: 2, n: 2 },
    },
  };
  ```

- Issue: Improve the storage density;
- Solution: Bucket the data by quarter.

#### Application Version 6 Revision 1

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    items: {
      '0625': { a: 2, n: 2 },
      '0615': { a: 2, n: 2, p: 3, r: 1 },
      '0515': { a: 2, n: 2, p: 3, r: 1 },
    },
  };
  ```

- Issue: Pre calculate report;
- Solution: Computed Pattern.

### Version 5 Revision 1

```ts
type SchemaV5R1 = {
  _id: Buffer;
  report: {
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  items: {
    [date as string]: {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    };
  };
};
```

#### Application Version 6 Revision 2

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    reports: {
      a: 6,
      n: 6,
      p: 6,
      r: 2,
    },
    items: {
      '0625': { a: 2, n: 2 },
      '0615': { a: 2, n: 2, p: 3, r: 1 },
      '0515': { a: 2, n: 2, p: 3, r: 1 },
    },
  };
  ```

- Issue: To generate the reports, 5 aggregation pipelines are being executed;
- Solution: Generate all the reports with just one aggregation pipeline.

#### Application Version 6 Revision 3

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    items: {
      '20220625': { a: 2, n: 2 },
      '20220615': { a: 2, n: 2, p: 3, r: 1 },
      '20220515': { a: 2, n: 2, p: 3, r: 1 },
    },
  };
  ```

- Issue: Disk is the limiting factor, change the compression algorithm;
- Solution: Use zst compression.

#### Application Version 6 Revision 4

- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Document:

  ```ts
  const doc = {
    _id: Buffer.from('0000000000000000000000000000000000000000000000000000000000000001202302', 'hex'),
    items: {
      '20220625': { a: 2, n: 2 },
      '20220615': { a: 2, n: 2, p: 3, r: 1 },
      '20220515': { a: 2, n: 2, p: 3, r: 1 },
    },
  };
  ```
