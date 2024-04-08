# The cost of not knowing MongoDB

### App V0

- Schema:
  ```ts
  type DocV0 = {
    _id: {
      date: Date;
      key: string;
    };
    approved?: number;
    noFunds?: number;
    pending?: number;
    rejected?: number;
  };
  ```
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: The `_id` indexes its value as a blob, so it's not used by the report aggregation.
  ```ts
  const matchStage = {
    '_id.key': key,
    '_id.date': { $gte: dateStart, $lte: dateEnd },
  };
  ```

### App V1

- Schema:
  ```ts
  type DocV1 = {
    _id: {
      date: Date;
      key: string;
    };
    approved?: number;
    noFunds?: number;
    pending?: number;
    rejected?: number;
  };
  ```
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }, { '_id.key': 1, '_id.date': 1 }];
  ```
- Issue/Improvement: The two indexes are indexing the "same" data but just one can make the correct use of it, the fields in the two indexes have big values, so `_id` is wasting indexes size by not being used by the application and being big.

### App V2

- Schema:
  ```ts
  type DocV2 = {
    _id: ObjectId;
    date: Date;
    key: string;
    approved?: number;
    noFunds?: number;
    pending?: number;
    rejected?: number;
  };
  ```
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }, { key: 1, date: 1 }];
  ```
- Issue/Improvement: We have two indexes on the collection but just one is being used. It's possible to make use of `_id` to support the application by making it a buffer value composed by the concatenation of `key` and `date`.

### App V3

- Schema:
  ```ts
  type DocV3 = {
    _id: Buffer;
    approved?: number;
    noFunds?: number;
    pending?: number;
    rejected?: number;
  };
  ```
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: The fields name size are relatively big compared to their values and the document size. It's possible to make the document 30% smaller by using abbreviation.

### App V4

- Schema:
  ```ts
  type DocV4 = {
    _id: Buffer;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  ```
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: It's possible to improve the information density by document and index entry using the bucket pattern. Bucket the data by month.

### App V5

- Schema:
  ```ts
  type DocV5 = {
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
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: It's possible to pre-calculate the values in a monthly report in the document by using the computed pattern.

### App V6

- Schema:
  ```ts
  type DocV6 = {
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
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: It's possible to generate the full report with just one aggregation pipeline

  ```ts
  const report = {
    oneYear: 0,
    twoHalfYears: 0,
    fiveYears: 0,
    sevenHalfYears: 0,
    tenYears: 0,
  };

  for (const doc in docs) {
    switch (doc.date) {
      case underOneYear(doc.date):
        report.oneYear += buildReport(doc.report);
      case underTwoHalfYears(doc.date):
        report.twoHalfYears += buildReport(doc.report);
      case underFiveYears(doc.date):
        report.fiveYears += buildReport(doc.report);
      case underSevenHalfYears(doc.date):
        report.sevenHalfYears += buildReport(doc.report);
      case underTenYears(doc.date):
        report.tenYears += buildReport(doc.report);
      default:
        break;
    }
  }
  ```

### App V7

- Schema:
  ```ts
  type DocV7 = {
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
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: It's possible to improve the storage by using `ztsd` compression instead of `snappy`.

### App V8

- Schema:
  ```ts
  type DocV8 = {
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
- Indexes:
  ```ts
  const indexes = [{ _id: 1 }];
  ```
- Issue/Improvement: Let's try time series collection to see how the performance gols.

### App V9

- Schema:
  ```ts
  type DocV9 = {
    _id: ObjectId;
    date: Date;
    key: string;
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  ```
- Collection Configuration:
  ```ts
  await this.db.createCollection('appV9', {
    timeseries: {
      timeField: 'date',
      metaField: 'key',
      granularity: 'hours',
    },
  });
  ```
- Issue/Improvement: That's all folks.
