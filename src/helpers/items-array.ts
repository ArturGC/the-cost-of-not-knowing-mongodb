import type * as T from '../types';

const buildItemSum = (doc: T.Event): Record<string, unknown> => {
  const newDoc: Record<string, unknown> = {
    date: '$$this.date',
    a: '$$this.a',
    n: '$$this.n',
    p: '$$this.p',
    r: '$$this.r',
  };

  if (doc.approved != null) newDoc.a = { $add: [doc.approved, { $cond: ['$$this.a', '$$this.a', 0] }] };
  if (doc.noFunds != null) newDoc.n = { $add: [doc.noFunds, { $cond: ['$$this.n', '$$this.n', 0] }] };
  if (doc.pending != null) newDoc.p = { $add: [doc.pending, { $cond: ['$$this.p', '$$this.p', 0] }] };
  if (doc.rejected != null) newDoc.r = { $add: [doc.rejected, { $cond: ['$$this.r', '$$this.r', 0] }] };

  return newDoc;
};

export const buildResultIfItemExists = (doc: T.Event): Record<string, unknown> => {
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

export const buildNewReport = (doc: T.Event): Record<string, unknown> => {
  const newReport: Record<string, unknown> = {};

  if (doc.approved != null) newReport['report.a'] = { $add: [doc.approved, { $cond: ['$report.a', '$report.a', 0] }] };
  if (doc.noFunds != null) newReport['report.n'] = { $add: [doc.noFunds, { $cond: ['$report.n', '$report.n', 0] }] };
  if (doc.pending != null) newReport['report.p'] = { $add: [doc.pending, { $cond: ['$report.p', '$report.p', 0] }] };
  if (doc.rejected != null) newReport['report.r'] = { $add: [doc.rejected, { $cond: ['$report.r', '$report.r', 0] }] };

  return newReport;
};

export const buildItemsOrCreateNew = (doc: T.Event): Record<string, unknown> => {
  return {
    $cond: {
      if: '$result.found',
      then: '$result.items',
      else: {
        $concatArrays: [
          '$result.items',
          [
            {
              date: doc.date,
              a: doc.approved,
              n: doc.noFunds,
              p: doc.pending,
              r: doc.rejected,
            },
          ],
        ],
      },
    },
  };
};

export const buildFieldAccumulator = (field: string): Record<string, unknown> => {
  return { $add: [`$$value.${field}`, { $cond: [`$$this.${field}`, `$$this.${field}`, 0] }] };
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
            $and: [{ $gte: ['$$this.date', date.start] }, { $lt: ['$$this.date', date.end] }],
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
