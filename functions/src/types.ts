import type { WhereFilterOp } from "firebase-admin/firestore";
export enum LikeDislike {
  like = "LIKE",
  dislike = "DISLIKE",
  none = "NONE",
}

enum NumberQueryOperator {
  LESS = "LESS",
  LESSEQ = "LESSEQ",
  EQUAL = "EQUAL",
  NOTEQUAL = "NOTEQUAL",
  GREATEQ = "GREATEQ",
  GREAT = "GREAT",
}

export type NumberQuery = {
  value: number;
  operator: NumberQueryOperator;
};

const numQueryOperators = new Map<NumberQueryOperator, WhereFilterOp>();
numQueryOperators.set(NumberQueryOperator.LESS, "<");
numQueryOperators.set(NumberQueryOperator.LESSEQ, "<=");
numQueryOperators.set(NumberQueryOperator.EQUAL, "==");
numQueryOperators.set(NumberQueryOperator.NOTEQUAL, "!=");
numQueryOperators.set(NumberQueryOperator.GREATEQ, ">=");
numQueryOperators.set(NumberQueryOperator.GREAT, ">");
export const numberQueryOperators = numQueryOperators;

export type StatsInput = {
  videoId: string;
  likeDislike?: LikeDislike;
  watched?: boolean;
  progress?: NumberQuery;
};

export type Stats = {
  id: string;
  userId: string;
  likeDislike?: LikeDislike;
  watched?: boolean;
  progress?: number;
};

export type VideoStatsQueryInput = {
  videoId: string;
  likeDislike: LikeDislike;
  watched: boolean;
};

export type StatsQueryInput = {
  videoIds: [string];
  likeDislike?: [LikeDislike];
  watched?: boolean;
  progress: NumberQuery;
};
