import type * as T from '../types';

const buildItemSum = (doc: T.Transaction): Record<string, unknown> => {
  const newDoc: Record<string, unknown> = {
    date: '$$this.date',
    a: '$$this.a',
    n: '$$this.n',
    p: '$$this.p',
    r: '$$this.r',
  };

  if (doc.a != null)
    newDoc.a = { $add: [doc.a, { $cond: ['$$this.a', '$$this.a', 0] }] };
  if (doc.n != null)
    newDoc.n = { $add: [doc.n, { $cond: ['$$this.n', '$$this.n', 0] }] };
  if (doc.p != null)
    newDoc.p = { $add: [doc.p, { $cond: ['$$this.p', '$$this.p', 0] }] };
  if (doc.r != null)
    newDoc.r = { $add: [doc.r, { $cond: ['$$this.r', '$$this.r', 0] }] };

  return newDoc;
};

export const buildResultIfItemExists = (
  doc: T.Transaction
): Record<string, unknown> => {
  const itemsOrEmptyArray = {
    $cond: ['$items', '$items', []],
  };
  const reduceInitialValue = {
    found: false,
    items: [],
  };
  const itemDateEqualDocDate = {
    $not: { $eq: ['$$this.date', doc.date] },
  };
  const valueWithNoChange = {
    found: '$$value.found',
    items: { $concatArrays: ['$$value.items', ['$$this']] },
  };
  const valueWithSumDoc = {
    found: true,
    items: { $concatArrays: ['$$value.items', [buildItemSum(doc)]] },
  };
  const reduceLoopLogic = {
    $cond: {
      if: itemDateEqualDocDate,
      then: valueWithNoChange,
      else: valueWithSumDoc,
    },
  };

  return {
    $reduce: {
      input: itemsOrEmptyArray,
      initialValue: reduceInitialValue,
      in: reduceLoopLogic,
    },
  };
};

export const buildNewReport = (doc: T.Transaction): Record<string, unknown> => {
  const newReport: Record<string, unknown> = {};

  if (doc.a != null) {
    newReport['report.a'] = {
      $add: [doc.a, { $cond: ['$report.a', '$report.a', 0] }],
    };
  }

  if (doc.n != null) {
    newReport['report.n'] = {
      $add: [doc.n, { $cond: ['$report.n', '$report.n', 0] }],
    };
  }

  if (doc.p != null) {
    newReport['report.p'] = {
      $add: [doc.p, { $cond: ['$report.p', '$report.p', 0] }],
    };
  }

  if (doc.r != null) {
    newReport['report.r'] = {
      $add: [doc.r, { $cond: ['$report.r', '$report.r', 0] }],
    };
  }

  return newReport;
};

export const buildItemsOrCreateNew = (
  doc: T.Transaction
): Record<string, unknown> => {
  const { key, ...newDoc } = doc;

  return {
    $cond: {
      if: '$result.found',
      then: '$result.items',
      else: { $concatArrays: ['$result.items', [newDoc]] },
    },
  };
};

export const buildFieldAccumulator = (
  field: string
): Record<string, unknown> => {
  return {
    $add: [
      `$$value.${field}`,
      { $cond: [`$$this.${field}`, `$$this.${field}`, 0] },
    ],
  };
};

export const buildItemsReduceAccumulator = ({
  date,
}: {
  date: { end: Date; start: Date };
}): Record<string, unknown> => {
  return {
    $reduce: {
      input: '$items',
      initialValue: { a: 0, n: 0, p: 0, r: 0 },
      in: {
        $cond: {
          if: {
            $and: [
              { $gte: ['$$this.date', date.start] },
              { $lt: ['$$this.date', date.end] },
            ],
          },
          then: {
            a: buildFieldAccumulator('a'),
            n: buildFieldAccumulator('n'),
            p: buildFieldAccumulator('p'),
            r: buildFieldAccumulator('r'),
          },
          else: '$$value',
        },
      },
    },
  };
};
