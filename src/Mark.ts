export const X = "x";
export const O = "o";

export type Mark = typeof X | typeof O;
export type MarkOrEmpty = Mark | null;
