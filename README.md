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
- Solution: Change the `_id` field to be the concatenation of the fields `key` and `date`, and as its content is hexadecimal characters, store it as binary.

  ```ts
  const keyString =
    '0000000000000000000000000000000000000000000000000000000000000001';

  const day = new Date('2023-06-15');
  const dayDataString = day.toISOString().split('T')[0]; // "2023-06-15";
  const dayDataSemTracoString = dayDataString.replace(/-/g, ''); // "20230615"

  const _idString = keyString + dayDataSemTracoString;
  // _idString = "000000000000000000000000000000000000000000000000000000000000000120230615"
  const _id = Buffer.from(_idString, 'hex');
  // _id = <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 20 23 06 15>
  ```

### Version 1

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

### Version 2

```ts
type SchemaV2 = {
  _id: Buffer;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};
```

### Version 3

```ts
type SchemaV3 = {
  _id: Buffer;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};
```

### Version 4 Revision 0

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

### Version 4 Revision 1

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

### Version 5 Revision 0

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
